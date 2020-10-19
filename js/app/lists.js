//This fila contains Controllers and Services related to List

memoruAngular.controller('ListsCtrl',
	['$rootScope','$scope','$firebaseAuth','$firebaseArray','ListsSvc','AlertsSvc',
    function($rootScope,$scope,$firebaseAuth,$firebaseArray,ListsSvc,AlertsSvc){

        //Fetch all Lists from db, for the current User
        let userId = $rootScope.activeSession.userID;
        if(!$rootScope.allUserLists){
            $rootScope.allUserLists = $firebaseArray( ListsSvc.getUserListsRef(userId) );
        }

        $scope.createDefaultLists = function(){
            let userId = memoruConstants.test.userID;
            ListsSvc.updateList(userId,memoruConstants.defaultLists);
        };
        
        $scope.newlist={locked:false,counts:{total:0, open:0}};
        $scope.createNewList = function(){
            $scope.response = {};
            let userId = $rootScope.activeSession.userID;

            //Create a new list only if another one does not already exist with the same name
            ListsSvc.getUserListByName(userId, $scope.newlist.name).then(function(snapshot){
                $scope.$apply(function(){
                    if(snapshot.val()){
                        $scope.response = {failed:true, title: AlertsSvc.getRandomErrorTitle(), 
                                message: $rootScope.i18n.lists.alreadyExist };
                        return;
                    }

                    $scope.newlist.creation = {
                        id: $rootScope.activeSession.userID, 
                        name: $rootScope.activeSession.username,
                        on: firebase.database.ServerValue.TIMESTAMP };
                    
                    //Create new list using the firebaseArray
                    $rootScope.allUserLists.$add($scope.newlist).then(function(ref){
                        $scope.newlist={locked:false,counts:{total:0, open:0}};
                        $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.lists.created };
                    }).catch(function(error) {
                        console.error(error);
                        $scope.response = {failed:true, title: AlertsSvc.getRandomErrorTitle(), message: error};
                    });
                });

            });
        };

        $scope.deleteList = function(listId){
            $scope.response = {};
            var listItem = $rootScope.allUserLists.$getRecord(listId);
            // $scope.$apply(function(){
                $rootScope.allUserLists.$remove(listItem).then(function(ref) {
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.lists.deleted };
                }).catch(function(error) {
                    console.error(error);
                    $scope.response = {failed:true, title: AlertsSvc.getRandomErrorTitle(), message: error};
                });
            // });
        };
        
    }]
);
    
memoruAngular.factory('ListsSvc',
    ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
        let usersFolderRef = memoruFireDb.ref(memoruConstants.db.folders.users);
        let listsFolder = memoruConstants.db.folders.lists;
        let listnameField = memoruConstants.db.fields.listname;

        return{
            updateList: function(userId,listObj){
                usersFolderRef.child(userId).child(listsFolder).update(listObj);
            },
            // createList: function(userId,listObj){
            //     let newListRef = usersFolderRef.child(userId).child(listsFolder).push();
            //     newListRef.set(listObj);
            // },
            getUserListsRef: function(userId){
                return usersFolderRef.child(userId).child(listsFolder);
            },
            getUserListByName: function(userId,listname){
                console.debug("Searching list:",listname);
                return usersFolderRef.child(userId).child(listsFolder).orderByChild(listnameField).equalTo(listname).once('value');                    
            }
        }
    }]
);

memoruAngular.factory('AlertsSvc',
    ['$rootScope', '$firebaseArray', '$firebaseObject',
	function($rootScope, $firebaseArray, $firebaseObject){
        
        return{
            getRandomErrorTitle: function(){
                return "Oh no!"
            },
            getRandomSuccessTitle: function(){
                return "Yuju!"
            }
        }
    }]
);