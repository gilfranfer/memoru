//This fila contains Controllers and Services related to List

memoruAngular.controller('ListsCtrl',
	['$rootScope','$scope','$firebaseAuth','$location',
    function($rootScope,$scope,$firebaseAuth,$location){

        $scope.createDefaultLists = function(){
            let userId = constants.test.userID;
            let usersFolder = constants.db.folders.users;

            var postData = {
                author: "username",
                uid: "uid",
                body: "body"
              };
            firebase.database().ref(usersFolder.child(userId)).update({
                postData 
            });
        };

    }]
);

memoruAngular.factory('ListsSvc',
    ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){

    }]
);