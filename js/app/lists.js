var defaultLists = [
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

/* This controller is used to Manage User's list */
memoruAngular.controller('ListsCtrl',
	['$rootScope','$scope','$firebaseAuth','ListsSvc','TasksSvc','AlertsSvc',
    function($rootScope,$scope,$firebaseAuth,ListsSvc,TasksSvc,AlertsSvc){

        /* Fetch all Lists from db for the current User and set into $rootScope
            Using "onSnapshot" to listen for real time changes.*/
        let userId = $rootScope.activeSession.userID;
        if(!$rootScope.allUserlists){
            var userlistsRef = ListsSvc.getListsCollectionForUser(userId);
            userlistsRef.onSnapshot(function(querySnapshot){
                let lists = [];
                if(querySnapshot.metadata.hasPendingWrites){return;}
                querySnapshot.forEach(function(doc) {
                    lists.push(doc.data());
                    console.log("List:",doc.data().name);
                });

                $scope.$apply(function(){
                    $rootScope.allUserlists = lists;
                });
            });
            
        }
        
        $scope.createDefaultLists = function(){
            defaultLists.forEach(function(list){
                list.creator = "System";
                list.createdOn = firebase.firestore.FieldValue.serverTimestamp();
                ListsSvc.persistListForUser(list,userId);
            });
        };
        
        /** Only System default lists are locked */
        $scope.newlist={locked:false, visible:true,counts:{total:0, open:0},desc:''};
        $scope.addNewList = function(){
            $scope.response = {};
            let querySnapshot = ListsSvc.getUserListByName(userId,$scope.newlist.name);
            querySnapshot.then(function(data){
                if(data.size>0){
                    $scope.$apply(function(){
                        $scope.response = {failed:true, title: AlertsSvc.getRandomErrorTitle(), 
                                            message: $rootScope.i18n.lists.alreadyExist };
                    });
                }
                //Create a new list only if another one does not already exist with the same name
                else{
                    // $scope.newlist.creator = $rootScope.activeSession.username;
                    $scope.newlist.creator = $rootScope.activeSession.userID;
                    $scope.newlist.createdOn = firebase.firestore.FieldValue.serverTimestamp();

                    ListsSvc.persistListForUser($scope.newlist,userId).then(function(){
                        $scope.newlist={locked:false, visible:true,counts:{total:0, open:0},desc:''};
                        $scope.$apply(function(){
                            $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), 
                                                message: $rootScope.i18n.lists.created };
                        });
                    });
                }
            })
            .catch(function(error) {
                console.error("Error getting documents: ", error);
            });
        };

        $scope.deleteList = function(listId){
            $scope.response = {};
            
            ListsSvc.deleteListById(listId,userId).then(function() {
                if(listId == $rootScope.activeSession.preferences.lists.initialActivelistId){
                    resetDefaultActiveList();
                }
                //Move tasks in this list to 'default' list
                TasksSvc.moveTasktoList(userId,listId,'default');
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), 
                                        message: $rootScope.i18n.lists.deleted };
                });
            }).catch(function(error) {
                $scope.response = {failed:true, title: AlertsSvc.getRandomErrorTitle(), message: error};
                console.error("Error removing document: ", error);
            });
        };
        
        $scope.editList = function(list){
            $scope.response = {};
            let querySnapshot = ListsSvc.getUserListByNameAndId(userId, list.name, list.id);
            querySnapshot.then(function(data){
                if(data.size>0){
                    $scope.$apply(function(){
                        $scope.response = {failed:true, title: AlertsSvc.getRandomErrorTitle(), 
                                            message: $rootScope.i18n.lists.alreadyExist };
                    });
                }
                //Update list only if another one does not already exist with the same name
                else{
                    ListsSvc.updateListForUser(list,userId).then(function(){
                        $scope.$apply(function(){
                            $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), 
                                                message: $rootScope.i18n.lists.updated };
                        });
                    });
                }
            })
            .catch(function(error) {
                console.error("Error getting documents: ", error);
            });

        };

        $scope.makeListVisible = function(list,visible){
            list.visible = visible;
            ListsSvc.updateListVisibility(list,userId).then(function(){
                if(list.id == $rootScope.activeSession.preferences.lists.initialActivelistId){
                    resetDefaultActiveList();
                }
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), 
                                        message: $rootScope.i18n.lists.updated };
                });
            });
        };

        /** When a list is deleted or its visibility is updated, we need to update the user's initial active list preference to the 'default' list */
        var resetDefaultActiveList = function(){
            console.error("need to reset default list");
        };

    }]
);
    
memoruAngular.factory('ListsSvc', ['$rootScope', 
	function($rootScope){
        // let usersFolderRef = memoruStore.ref(memoruConstants.db.folders.users);
        // let ownedListsFolder = memoruConstants.db.folders.mylists;
        // let listnameField = memoruConstants.db.fields.listname;
        let userLists = memoruConstants.db.collections.userlists;
        let ownedLists = memoruConstants.db.collections.ownedlists;
        
        return{
            getListsCollectionForUser: function(userId){
                return memoruStore.collection(userLists).doc(userId).collection(ownedLists);
            },
            getVisibleListsForUser: function(userId){
                return memoruStore.collection(userLists).doc(userId).collection(ownedLists).where("visible", "==", true);
            },
            /* Add a new document with an auto-generated id, and set that id inside the Doc (for future use) */
            persistListForUser: function(listObj,userId){
                let newListRef = undefined;
                if(listObj.id){
                    newListRef = memoruStore.collection(userLists).doc(userId).collection(ownedLists).doc(listObj.id);
                }else{
                    newListRef = memoruStore.collection(userLists).doc(userId).collection(ownedLists).doc();
                    listObj.id = newListRef.id
                }
                return newListRef.set(listObj);
            },
            /* Update document */
            updateListForUser: function(listObj,userId){
                let listRef = memoruStore.collection(userLists).doc(userId).collection(ownedLists).doc(listObj.id);
                return listRef.set(listObj);
            },
            /* Update List visible field */
            updateListVisibility: function(listObj,userId){
                let listRef = memoruStore.collection(userLists).doc(userId).collection(ownedLists).doc(listObj.id);
                return listRef.update({visible:listObj.visible});
            },
            /* Delete the document from DB. Please note that any subcollections in the Document are not deleted. Returning a promise. */
            deleteListById: function(listId,userId){
                return memoruStore.collection(userLists).doc(userId).collection(ownedLists).doc(listId).delete();
            },
            /* Search a user's list by name.*/
            getUserListByName: function(userId,listname){
                let query = memoruStore.collection(userLists).doc(userId).collection(ownedLists).where('name','==',listname);
                return query.get();               
            },
            /* Search a user's list by name and Id (used when editing list's name. */
            getUserListByNameAndId: function(userId,listname,listId){
                let query = memoruStore.collection(userLists).doc(userId).collection(ownedLists)
                    .where('name','==',listname).where('id','!=',listId);
                return query.get();               
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