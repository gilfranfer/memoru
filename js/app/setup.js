/* Initialize database connection using the firebaseConfig defined direclty in netlify host */
var memoruFire = firebase.initializeApp(firebaseConfig); 
var memoruAngular = angular.module('memoruApp',['ngRoute','firebase']);

var constants = {
    db:{ 
        folders:{
            users:"memoru/users",
            lists: "lists"
        }
    },
    test:{
       userID: "test-id"
    }
};

/* Run function is executed after .config, and before .controller */
memoruAngular.run(function($rootScope) {
	$rootScope.appConstants = {
        app:{name:"Memoru", version: "1.0"},
    };

    $rootScope.i18n = {
        menu:{login:"Log in", logout: "Log out", register:"Register"},
        labels:{tasks:"Tasks"}
    };

    memoruFire.database().ref().child("memoru/users/test-id/auth").once('value').then(
		function(snapshot){
			if(snapshot.val()){
                console.debug("Got configurations from Firebase");
                console.log(snapshot.val());
			}else{
				console.error("Configurations not available in Firebase");
			}
	});

});
