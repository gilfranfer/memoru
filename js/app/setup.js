/** ##### APP CONSTANTS ##### **/
const memoruConstants = {
    db:{ 
        collections:{
            userlists:"lists", ownedlists:"owned",
            userTasks:"tasks", ownedTasks:"owned"
        },
        folders:{
            users:"memoru/users",
            mylists: "lists/owned",
            collablists: "lists/collab"
        },
        fields:{
            listname:"name"
        }
    },
    test:{
       userID: "test-id", username:"Test User"
    },
    front:{
        app:{name:"Memoru", version: "1.0"},
        sorting: { tasks: [{field:"name", desc:"Task name"},{field:"type", desc:"Task type"},
								{field:"createdOn", desc:"Creation"},{field:"duedate", desc:"Due Date"}] }
    },
	lightHourStart: 5, lightHourEnd: 17
};

const defaultLists = [
    {
        id:'archive',
        locked: true, visible:true,
        name:"Archive",
        desc:"System Archive"
    },
    {
        id:'all',
        locked: true, visible:true,
        name:"All",
        desc:"Show all tasks"
    },
    {
        id:'default',
        locked: true, visible:true,
        name:"Default",
        desc:"System Default"
        // counts:{ total:0 }
    }
];

const defaultPreferences = {
    // preferences: { 
        uiMode: "auto",
        lists:{ initialActivelistId: "default" },
        tasks:{ sorting:{field:"createdOn", desc:"Creation"}, showDuedate: true },
        goals:{ showBar: true, showProgress:true, progressOn:"desc"/*"perc"*/   }
    // }
}

/** ##### APP SETUP ##### **/
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
	})
	.when('/taskboard', {
	  templateUrl: 'views/tasks/tasks-board.html',
	  resolve: {
		currentAuth: function(UserSvc){
		  return UserSvc.isUserLoggedIn();
		}
	  }
	})
	.when('/preferences', {
	  templateUrl: 'views/preferences.html',
	  resolve: {
		currentAuth: function(UserSvc){
		  return UserSvc.isUserLoggedIn();
		}
	  }
	})
	.when('/task/:taskId', {
	  templateUrl: 'views/tasks/task-edit.html',
	  resolve: {
		currentAuth: function(UserSvc){
		  return UserSvc.isUserLoggedIn();
		}
	  }
	})
	.when('/lists', {
	  templateUrl: 'views/lists/list-admin.html',
	  controller: 'ListsCtrl',
	  resolve: {
		currentAuth: function(UserSvc){
		  return UserSvc.isUserLoggedIn();
		}
	  }
	})
	.otherwise({
	  redirectTo: '/taskboard'
	});
	$locationProvider.html5Mode(false);
});

/* Run function is executed after .config, and before .controller */
memoruAngular.run(function($rootScope) {	
	$rootScope.appConstants = memoruConstants.front;
    $rootScope.i18n = languages.english;
	$rootScope.activeSession = {  
		preferences: {uiMode:"auto"}
	};

	//For auto UI Mode when no one is logged id
	let now = new Date();
	if( $rootScope.activeSession.preferences.uiMode == "auto" 
		&& now.getHours() >= memoruConstants.lightHourStart && now.getHours() <= memoruConstants.lightHourEnd ){
		/** On Auto mode, light UI is from 7am to 5pm */
		$rootScope.activeSession.preferences.darkMode = false;
	}else{
		$rootScope.activeSession.preferences.darkMode = true;
	}
});
