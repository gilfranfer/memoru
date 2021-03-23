/* Initialize database connection using the firebaseConfig defined direclty in netlify host */
firebase.initializeApp(firebaseConfig); 
var memoruStore = firebase.firestore(); 
var memoruAngular = angular.module('memoruApp',['ngRoute','firebase']);

/* Configure application routes */
memoruAngular.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/about', {
	  templateUrl: 'views/about.html'
	})
	.when('/register', {
	  templateUrl: 'views/auth/register.html'
	//   controller: 'SignUpCtrl'
	})
	.when('/login', {
	  templateUrl: 'views/auth/login.html'
	//   ,controller: 'SignUpCtrl'
	})
	.when('/taskboard', {
	  templateUrl: 'views/tasks/tasks-board.html'
	//   controller: 'UserProfileCtrl',
	//   resolve: {
	// 	currentAuth: function(SignUpSvc){
	// 	  return SignUpSvc.isUserLoggedIn();
	// 	}
	//   }
	})
	.when('/preferences', {
	  templateUrl: 'views/preferences.html'
	//   controller: 'PreferencesCtrl',
	//   resolve: {
	// 	currentAuth: function(SignUpSvc){
	// 	  return SignUpSvc.isUserLoggedIn();
	// 	}
	//   }
	})
	.when('/task/:taskId', {
	  templateUrl: 'views/tasks/task-edit.html'
	//   controller: 'ResumeViewCtrl'
	})
	.when('/lists', {
	  templateUrl: 'views/lists/list-admin.html',
	  controller: 'ListsCtrl'
	})
	.otherwise({
	  redirectTo: '/taskboard'
	});
	$locationProvider.html5Mode(false);
});

/* Run function is executed after .config, and before .controller */
memoruAngular.run(function($rootScope, PreferencesSvc, $location) {
	$rootScope.appConstants = memoruConstants.front;
    $rootScope.i18n = languages.english;
	
	$rootScope.activeSession = { 
		userID: memoruConstants.test.userID, 
		username: memoruConstants.test.username,  
		preferences: defaultPreferences
	};

	// Load preferences from Firestore
	PreferencesSvc.getUserPreferences($rootScope.activeSession.userID).onSnapshot( (doc) => {
		if (doc.exists) {
			let now = new Date();
			let userPreferences = doc.data().preferences;
			
			if( userPreferences.uiMode == "light" || ( userPreferences.uiMode == "auto" && now.getHours() >= 7 && now.getHours() <= 17 ) ){
				/** On Auto mode, light UI is from 7am to 5pm */
				userPreferences.darkMode = false;
			}else{
				userPreferences.darkMode = true;
			}
			$rootScope.$apply(()=>{ $rootScope.activeSession.preferences = userPreferences });
		} else {
			// doc.data() will be undefined in this case
			console.error("No User Preferences. Using default ones.");
		}
	});

	/* Catch routeChangeErrors from $routeProvider when a route has a resolve. */
	// app.run(function($rootScope,$location){
	$rootScope.$on('$routeChangeError', function(event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
      		//User is not logged in.
		}else{
			// $rootScope.response = {error:true, message: error};
		}
		console.log("routeChangeError");
		console.log(event, next, previous, error);
		// $location.path( values.paths.login );
	});
	// });

});

memoruAngular.controller('HeaderCtrl',
	['$rootScope','$scope','$firebaseAuth','TasksSvc',
    function($rootScope,$scope,$firebaseAuth,TasksSvc){
        		
		let counterRef = TasksSvc.getOpenTasksCount($rootScope.activeSession.userID);
		counterRef.onSnapshot((doc) => {
			if (doc.exists ) {
                $scope.$apply(()=>{ $rootScope.openTasksCount =  doc.data(); });
			} else {
				// doc.data() will be undefined in this case
				console.error("No Open Tasks Counter!");
			}
		});
    }]
);

memoruAngular.controller('PreferencesCtrl',
	['$rootScope','$scope','$firebaseAuth','PreferencesSvc','ListsSvc',
    function($rootScope,$scope,$firebaseAuth,PreferencesSvc,ListsSvc){

		/** User preferences are loaded, from Firebase, with angular Run Function */
		// console.debug($rootScope.activeSession.preferences);
		
		// Use this aftert User Creation. Default preferences (defaultPreferences) from constants.js 
		// PreferencesSvc.updatePreferences($rootScope.activeSession.userID, defaultPreferences ).then(function(data){
		// 	console.log(data);
		// });

		ListsSvc.getVisibleListsForUser($rootScope.activeSession.userID).onSnapshot(function(querySnapshot){
			let lists = [];
			let activeListObj = undefined;    
			let activeListId = $rootScope.activeSession.preferences.lists.initialActivelistId;

			querySnapshot.forEach(function(listDoc) {
				lists.push(listDoc.data());
				if(listDoc.data().id == activeListId){
					activeListObj = listDoc.data();
				}
			});

			$scope.$apply(function(){ 
				$scope.visibleUserlists = lists; 
				$scope.activeList = activeListObj;
			});
		});
		
		$scope.changeInitialList = function(list){
			$scope.activeList = list;
			$rootScope.activeSession.preferences.lists.initialActivelistId = list.id;
		};
		
		$scope.changeInitialSort = function(sort){
			$rootScope.activeSession.preferences.tasks.sorting.field = sort.field;
			$rootScope.activeSession.preferences.tasks.sorting.desc = sort.desc;
		};
		
		$scope.savePreferences = function(){
			if(!$rootScope.activeSession.preferences.goals.showBar){
				$rootScope.activeSession.preferences.goals.showProgress = false;
			}
			PreferencesSvc.updatePreferences($rootScope.activeSession.userID, $rootScope.activeSession.preferences).then(function(){
				$scope.$apply(function(){
					$scope.response = {success:true, message: $rootScope.i18n.pref.saved };
				});
			});
		}

    }]
);

memoruAngular.factory('PreferencesSvc', ['$rootScope', 
	function($rootScope){
        
        return{
            getUserPreferences:  function(userId){
            	return memoruStore.collection("users").doc(userId); 
			},
            updatePreferences: function(userId, preference){
				return memoruStore.collection("users").doc(userId).update( {preferences: preference } );
            }
        }
    }]
);