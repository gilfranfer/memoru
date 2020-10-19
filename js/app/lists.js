//This fila contains Controllers and Services related to List

memoruAngular.controller('ListsCtrl',
	['$rootScope','$scope','$firebaseAuth','$firebaseArray','ListsSvc',
    function($rootScope,$scope,$firebaseAuth,$firebaseArray,ListsSvc){

        //Fetch all Lists from db, for the current User
        let userId = $rootScope.activeSession.userID;
        if(!$rootScope.allUserLists){
            $rootScope.allUserLists = $firebaseArray( ListsSvc.getUserListsRef(userId) );
        }

        $scope.createDefaultLists = function(){
            let userId = memoruConstants.test.userID;
            ListsSvc.createList(userId,memoruConstants.defaultLists);
        };
        
        $scope.newlist={locked:false,counts:{total:0}};
        $scope.createNewList = function(){
            $scope.newlist.creation = {
                id: $rootScope.activeSession.userID, 
                name: $rootScope.activeSession.username,
                on: firebase.database.ServerValue.TIMESTAMP };
                
            $rootScope.allUserLists.$add($scope.newlist).then(function(response){
                console.log(response);
                $scope.newlist={locked:false,counts:{total:0}};
            });
        };
        
    }]
);
    
memoruAngular.factory('ListsSvc',
    ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
        let usersFolder = memoruFireDb.ref(memoruConstants.db.folders.users);
        let listsFolder = memoruConstants.db.folders.lists;

        return{
            createList: function(userId,listObj){
                usersFolder.child(userId).child(listsFolder).update(listObj);
            },
            getUserListsRef: function(userId){
                return usersFolder.child(userId).child(listsFolder);
            }
        }
    }]
);