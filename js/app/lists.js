//This fila contains Controllers and Services related to List

memoruAngular.controller('ListsCtrl',
	['$rootScope','$scope','$firebaseAuth','ListsSvc',
    function($rootScope,$scope,$firebaseAuth,ListsSvc){

        $scope.createDefaultLists = function(){
            let userId = memoruConstants.test.userID;
            ListsSvc.createList(userId);
        };
        
    }]
);
    
    memoruAngular.factory('ListsSvc',
    ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
        let usersFolder = memoruFireDb.ref(memoruConstants.db.folders.users);
        let listsFolder = memoruConstants.db.folders.lists;

        return{
            createList: function(userId){
                usersFolder.child(userId).child(listsFolder).update(memoruConstants.defaultLists);
            }
        }
    }]
);