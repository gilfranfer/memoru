/* Initialize database connection using the firebaseConfig defined direclty in netlify host */
var memoruFire = firebase.initializeApp(firebaseConfig); 
var memoruAngular = angular.module('memoruApp',['ngRoute','firebase']);

/* Run function is executed after .config, and before .controller */
memoruAngular.run(function($rootScope) {
	$rootScope.appConstants = constants.front;
    $rootScope.i18n = languages.english;
    // memoruFire.database().ref().child("memoru/users/test-id/auth").once('value').then(
	// 	function(snapshot){
	// 		if(snapshot.val()){
    //             console.debug("Got configurations from Firebase");
    //             console.log(snapshot.val());
	// 		}else{
	// 			console.error("Configurations not available in Firebase");
	// 		}
	// });

});
