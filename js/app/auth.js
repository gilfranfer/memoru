/** This controller is set at <body> level. It is used to controll authentication related features like: 
 * user login; user logout; user registration; and Authorization State changes */
memoruAngular.controller('AuthCtrl',
['$rootScope','$scope','$location','UserSvc','ListsSvc','TasksSvc',
function($rootScope,$scope,$location,UserSvc,ListsSvc,TasksSvc){
    
    let userSnapshot = undefined;
    let openCountSnapshot = undefined;

    /** Detect changes on Authorization State. This is called after account creation, Login or logut. */
    firebase.auth().onAuthStateChanged((user) => {
		console.debug("onAuthStateChanged",user);
		if(user){
            //Load User doc from Firestore, which has preferences too
			userSnapshot = UserSvc.getUserDoc(user.uid).onSnapshot( (doc) => {
                console.log("userSnapshot");
				if(doc.exists){
					let now = new Date();
					let userPreferences = doc.data().preferences;
					// console.log("User Doc",doc.data());

                    if(!userPreferences) return;
					if( userPreferences.uiMode == "light" || ( userPreferences.uiMode == "auto" 
                        && now.getHours() >= memoruConstants.lightHourStart && now.getHours() <= memoruConstants.lightHourEnd ) ){
						/** On Auto mode, light UI is from 7am to 5pm */
						userPreferences.darkMode = false;
					}else{
						userPreferences.darkMode = true;
					}
					$rootScope.$apply(()=>{ 
						$rootScope.activeSession.userID = user.uid;
						$rootScope.activeSession.email = doc.data().email;
						$rootScope.activeSession.name = doc.data().name;
						$rootScope.activeSession.preferences = userPreferences;
						$rootScope.activeSession.emailVerified = user.emailVerified;
					});
				} else {
					// doc.data() will be undefined in this case
					console.error("No User Doc.");
				}
			});
			
            // Load Open Tasks Counter
			openCountSnapshot = TasksSvc.getOpenTasksCount(user.uid).onSnapshot((doc) => {
				console.log("openCountSnapshot");
                if (doc.exists){
					$rootScope.$apply(()=>{ $rootScope.activeSession.openTasksCount =  doc.data(); });
				} else {
					// doc.data() will be undefined in this case
					//console.error("No Open Tasks Counter!");
				}
			});
		}else{
            if(userSnapshot){ userSnapshot(); }
            if(openCountSnapshot){ openCountSnapshot(); }
            $rootScope.activeSession = {  
                preferences: defaultPreferences
            };
		}
	});

    $scope.pwdRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
    $scope.nameRegex = new RegExp("^[A-Za-z]+$");

    /** Create an Account for the user, and set the initial Lists, Preferences and Open tasks counter*/
    $scope.registerUser = function(){
        $scope.response = {type:"info", message: $rootScope.i18n.auth.regWip };
        let newUser = { id: undefined, name: $scope.registration.name, email: $scope.registration.email, 
                        since: firebase.firestore.FieldValue.serverTimestamp(), preferences: defaultPreferences };

        firebase.auth().createUserWithEmailAndPassword(newUser.email, $scope.registration.pwd)
        //User is automatically logged-in after registration
        .then((userCredential) => {
            $scope.$apply(()=>{ $scope.response = {type:"success", message:  $rootScope.i18n.auth.regDone } });
            newUser.id = userCredential.user.uid;
            //Create User Document in Firestore
            return UserSvc.createUserDoc(newUser);
        })
        .then(function(){
            $scope.$apply(()=>{ $scope.response = {type:"info", message:  $rootScope.i18n.auth.confWip } });
            //Create initial set of lists (defaultLists from constants)
            defaultLists.forEach(function(list){
                list.createdOn = firebase.firestore.FieldValue.serverTimestamp();
                ListsSvc.persistListForUser(list,newUser.id);
            });
            //Set tasks counter
            return TasksSvc.setOpenTaskCounter(newUser.id);
        })
        .then(function(){
            $rootScope.$apply(()=>{
                $rootScope.activeSession.userID = newUser.id;
				$rootScope.activeSession.email = newUser.email;
				$rootScope.activeSession.name = newUser.name;
				$rootScope.activeSession.preferences = defaultPreferences;
                $scope.response = null; 
                $location.path("/taskboard"); 
            });
        })
        .catch((error) => {
            // var errorCode = error.code;
            // var errorMessage = error.message;
            $scope.$apply(()=>{ $scope.response = {type:"danger", message: error.message }; }); 
        });
    };

    $scope.login = function(){
        firebase.auth().signInWithEmailAndPassword( $scope.loginUser.email, $scope.loginUser.pwd)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            $location.path("/taskboard");
        })
        .catch((error) => {
            $scope.$apply(function(){
                $scope.response = {error:true, message: $rootScope.i18n.auth.loginError };
            });
            var errorCode = error.code;
            var errorMessage = error.message;
        });
    };

    $scope.logout = function(){
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
            $rootScope.$apply(()=>{ 
                $rootScope.activeSession = {  
                    preferences: defaultPreferences
                };
             }); 
            $location.path("/about");
          }).catch((error) => {
            // An error happened.
          });
    };

    $scope.sendVerificationEmail = function(){
        $scope.verificationEmailSent = true;
        firebase.auth().currentUser.sendEmailVerification()
        .then(function() {
        // Verification email sent.
        })
        .catch(function(error) {
        // Error occurred. Inspect error.code.
        });
    };
    
    $scope.sendPasswordResetEmail = function(){
        if(!$scope.loginUser.email){
            $scope.response = {error:true, message: $rootScope.i18n.auth.invalidEmail };
            return;
        }
        
        // console.log("sendPasswordResetEmail");return;
        firebase.auth().sendPasswordResetEmail($scope.loginUser.email).then(function(){
            // Email sent.
            $scope.$apply(function(){
                $scope.response = {success:true, message: $rootScope.i18n.auth.resetPwdEmail };
            });
        }).catch(function(error) {
            // An error happened.
            console.error(error);
        });
    };

    /* Catch routeChangeErrors from $routeProvider when a route has a resolve. */
	$rootScope.$on('$routeChangeError', function(event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
            $location.path("/login");
		}else{
			// $rootScope.response = {error:true, message: error};
		}
		// console.log("routeChangeError",event, next, previous, error);
	});
}]
);

memoruAngular.factory('UserSvc', ['$firebaseAuth', 
	function($firebaseAuth){
        return{
            createUserDoc: function(user){
            	return memoruStore.collection("users").doc(user.id).set(user); 
			},
            getUserDoc:  function(userId){
            	return memoruStore.collection("users").doc(userId); 
			},
            isUserLoggedIn: function(){
				return $firebaseAuth().$requireSignIn();
			},
            updateUserPreferences: function(userId, preference){
				return memoruStore.collection("users").doc(userId).update( {preferences: preference } );
            } 
        }
    }]
);