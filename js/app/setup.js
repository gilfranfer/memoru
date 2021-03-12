/* Initialize database connection using the firebaseConfig defined direclty in netlify host */
firebase.initializeApp(firebaseConfig); 
var memoruStore = firebase.firestore(); 
var memoruAngular = angular.module('memoruApp',['ngRoute','firebase']);

/* Run function is executed after .config, and before .controller */
memoruAngular.run(function($rootScope) {
	$rootScope.appConstants = memoruConstants.front;
    $rootScope.i18n = languages.english;
	$rootScope.activeSession = { 
		userID: memoruConstants.test.userID, 
		username: memoruConstants.test.username,  
		preferences: { 
			lists:{ initialActivelistId: "default" },
			tasks:{ sorting:{field:"createdOn", desc:"Creation"} },
			goals:{ showBar: true, showProgress:true, progressOn:"desc"  }
		},
	}
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
			console.log("Here");
			if (doc.exists ) {
                $scope.$apply(()=>{ $rootScope.openTasksCount =  doc.data(); });
			} else {
				// doc.data() will be undefined in this case
				console.error("No Open Tasks Counter!");
			}
		});
		
    }]
);