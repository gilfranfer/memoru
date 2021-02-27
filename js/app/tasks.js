/* The Taskboard controller is used to Manage User's list of tasks. 
 It includes actions to Create, Delete, Close and Archive tasks. 
 On Taskboard init, we need to:
    - Fetch User Visible Lists (to use in the "list selector")
    - Set the "Active List" from preferences
    - Set Task Sorting preferences 
    - Load Open tasks for the Active List
*/
memoruAngular.controller('TaskboardCtrl',
	['$rootScope','$scope','$firebaseAuth','ListsSvc','TasksSvc','AlertsSvc',
    function($rootScope,$scope,$firebaseAuth,ListsSvc,TasksSvc, AlertsSvc){
        
        let userId = $rootScope.activeSession.userID;
        let openTaskStauts = 'open';
        $scope.taskType = 'task';

        /** METHODS */
        $scope.loadTasksWithStatus = function(status, list){
            $scope.response = {};
            $rootScope.loadedTasksStatus = status;
            
            if(!list){
                list= $rootScope.activeList.id;
            }

            console.debug("Loading tasks for list", list);
            let tasksListRef = TasksSvc.getTasksFromUserListWithStatus($rootScope.activeSession.userID, $rootScope.activeList.id, status );
            tasksListRef.onSnapshot(function(querySnapshot){
                let tasks = [];
                
                if(querySnapshot.metadata.hasPendingWrites){return;}
                querySnapshot.forEach(function(doc) {
                    // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
                    // console.log(source, " data: ", doc.data());
                    tasks.push(doc.data());
                });
                // console.log(tasks);
                $scope.$apply(function(){
                    $rootScope.tasksList = tasks;
                });
            });
        };

        $scope.addTask = function(){
            $scope.response = {};
            
            let newTask = {
                name: $scope.searchText,
                status: openTaskStauts,
                list: $rootScope.activeList.id,
                type: $scope.taskType,
                creator: userId,
                createdOn: firebase.firestore.FieldValue.serverTimestamp()
            };
            // console.debug(newTask);
            
            TasksSvc.persistTaskForUser(newTask, userId).then(function(){
                TasksSvc.updateOpenTaskCounter(userId,1)
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.tasks.created };
                });
            });
        };
        
        $scope.deleteTask = function(taskObj){
            $scope.response = {};
            
            TasksSvc.deleteUserTask(taskObj, userId).then(function(){
                if(taskObj.status=="open"){
                    TasksSvc.updateOpenTaskCounter(userId,-1)
                }
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.tasks.deleted };
                });
            });
        };
        
        $scope.closeTask = function(taskObj){
            let newStatus = 'closed';
            let openTasksIncrement = -1;
            let message = $rootScope.i18n.tasks.closed;
            $scope.updateTaskStatus(taskObj, newStatus, openTasksIncrement, message);
        };
        
        $scope.reopenTask = function(taskObj){
            let newStatus = 'open';
            let openTasksIncrement = 1;
            let message = $rootScope.i18n.tasks.reopened;
            $scope.updateTaskStatus(taskObj, newStatus, openTasksIncrement, message);
        };
        
        /** An archived task should */
        $scope.archiveTask = function(taskObj){
            let newStatus = 'archived';
            let openTasksIncrement = -1;
            let message = $rootScope.i18n.tasks.archived;
            $scope.updateTaskStatus(taskObj, newStatus, openTasksIncrement, message);
        };

        /** Toggle Task Status from open to closed, or viceversa */
        $scope.updateTaskStatus = function(taskObj,newStatus, openTasksIncrement,message){
            $scope.response = {};

            TasksSvc.updateTaskStatus(taskObj, userId, newStatus).then(function(){
                TasksSvc.updateOpenTaskCounter(userId, openTasksIncrement)
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: message };
                });
            });
            
        };
        
        $scope.changeActiveList = function(list){
            $rootScope.activeList = list;
            $scope.loadTasksWithStatus($rootScope.loadedTasksStatus,list); 
        };
        
        $scope.changeSort = function(sortOption){
            $rootScope.activeTaskSort = sortOption;
        };

        /** TASKBOARD INITIAL LOAD */

            /* Fetch all Visible Lists from db for the current User and set into $rootScope
            Using "onSnapshot" to listen for real time changes.*/
            if(!$rootScope.visibleUserlists){
                let userInitialActiveListId = $rootScope.activeSession.preferences.lists.initialActivelistId;
                let activeListObj = undefined;
                
                var userlistsRef = ListsSvc.getVisibleListsForUser(userId);
                userlistsRef.onSnapshot(function(querySnapshot){
                    let lists = [];
                    querySnapshot.forEach(function(listDoc) {
                        lists.push(listDoc.data());
                        // console.debug("List:",listDoc.data());
                        if(listDoc.data().id == userInitialActiveListId){
                            activeListObj = listDoc.data();
                        }
                    });

                    /* Set initial Active List */
                    if( !$rootScope.activeList ){
                        $rootScope.activeList = activeListObj;
                    }

                    $scope.loadTasksWithStatus("open",activeListObj); 
                    $scope.$apply(function(){
                        $rootScope.visibleUserlists = lists;
                    });
                });
            }

            /* Set initial Task Sorting from User preferences */
            if( !$rootScope.activeTaskSort ){
                $rootScope.activeTaskSort = $rootScope.activeSession.preferences.tasks.sorting;
                $scope.reverseSort = true;
            }
    }]
);

memoruAngular.factory('TasksSvc',
    ['$rootScope',
	function($rootScope){
        let userTasks = memoruConstants.db.collections.userTasks;
        let ownedTasks = memoruConstants.db.collections.ownedTasks;
        
        return{
            persistTaskForUser: function(taskObj,userId){
                let newTaskRef = memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc();
                taskObj.id = newTaskRef.id
                return newTaskRef.set(taskObj);
            },
            deleteUserTask: function(taskObj, userId){
                return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskObj.id).delete();
            },
            updateTaskStatus: function(taskObj, userId, status){
                return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskObj.id).update({
                    status: status
                });
            },
            updateOpenTaskCounter: function(userId, increment){
                return memoruStore.collection(userTasks).doc(userId).update({
                    open: firebase.firestore.FieldValue.increment(increment)
                });
            },
            /** Returns a refernce to the tasks for the specified User, List and Status*/
            getTasksFromUserListWithStatus: function(userId, listId, taskStatus){
                return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks)
                    .where('list','==',listId).where('status','==',taskStatus);
            }
        }
    }]
);