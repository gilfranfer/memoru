/* Initialize database connection using the firebaseConfig defined direclty in netlify host */
firebase.initializeApp(firebaseConfig); 
var memoruStore = firebase.firestore(); 
var memoruAngular = angular.module('memoruApp',['ngRoute','firebase']);

/* Configure application routes */
memoruAngular.config(function($routeProvider, $locationProvider) {
	$routeProvider
	// .when('/home', {
	//   templateUrl: 'views/landing.html'
	// })
	// .when('/register', {
	//   templateUrl: 'views/register.html',
	//   controller: 'SignUpCtrl'
	// })
	// .when('/login', {
	//   templateUrl: 'views/login.html',
	//   controller: 'SignUpCtrl'
	// })
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
	//   controller: 'CustomizeCtrl',
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

/* Catch routeChangeErrors from $routeProvider when a route has a resolve. */
memoruAngular.run(function($rootScope,$location){
	$rootScope.$on('$routeChangeError', function(event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
      //User is not logged in.
		}else{
			// $rootScope.response = {error:true, message: error};
		}
		$location.path( values.paths.login );
	});
});

/* Run function is executed after .config, and before .controller */
memoruAngular.run(function($rootScope) {
	$rootScope.appConstants = memoruConstants.front;
    $rootScope.i18n = languages.english;
	$rootScope.activeSession = { 
		userID: memoruConstants.test.userID, 
		username: memoruConstants.test.username,  
		preferences: { 
			lists:{ initialActivelistId: "default" },
			tasks:{ sorting:{field:"createdOn", desc:"Creation"}, showDuedate: true },
			goals:{ showBar: true, showProgress:true, progressOn:"desc"/*"perc"*/   }
		}
	};

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

    // memoruFireDb.ref().child("memoru/users/test-id/auth").once('value').then(
	// 	function(snapshot){
	// 		if(snapshot.val()){
    //             console.debug("Got configurations from Firebase");
    //             console.log(snapshot.val());
	// 		}else{
	// 			console.error("Configurations not available in Firebase");
	// 		}
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