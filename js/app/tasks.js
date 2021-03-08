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
        let newTaskStatus = 'open';
        $scope.taskType = 'task';
        $scope.goalValues = { current:0};

        /** METHODS */
        $scope.loadTasksWithStatus = function(status){
            $scope.response = {};
            $scope.loadedTasksStatus = status;
            
            let tasksListRef = TasksSvc.getTasksFromUserListWithStatus(userId, $rootScope.activeList.id, status);
            tasksListRef.onSnapshot(function(querySnapshot){
                let tasks = [];
                
                if(!$rootScope.forceRefresh && querySnapshot.metadata.hasPendingWrites){return;}
                querySnapshot.forEach(function(doc) {
                    tasks.push(doc.data());
                });

                $scope.$apply(function(){
                    $rootScope.tasksList = tasks;
                    $rootScope.forceRefresh = null;
                });
            });
        };

        $scope.addTask = function(){
            $scope.response = {};
            
            let newTask = {
                name: $scope.searchText,
                status: newTaskStatus,
                list: $rootScope.activeList.id,
                type: $scope.taskType,
                creator: userId,
                createdOn: firebase.firestore.FieldValue.serverTimestamp()
            };

            if(newTask.type == 'goal'){
                newTask.goal = $scope.goalValues;
                if( isNaN(newTask.goal.current) || isNaN(newTask.goal.end) ){
                    $scope.response = {failed:true, message: $rootScope.i18n.tasks.notANumber };
                    return;
                }
                newTask.goal.current = ( Number.isInteger(newTask.goal.current)? newTask.goal.current: Number(newTask.goal.current.toFixed(2)) ); 
                newTask.goal.end = ( Number.isInteger(newTask.goal.end)? newTask.goal.end: Number(newTask.goal.end.toFixed(2)) );     
            }

            TasksSvc.persistTaskForUser(newTask, userId).then(function(){
                TasksSvc.updateOpenTaskCounter(userId,1)
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.tasks.created };
                    $scope.goalValues = { current:0};
                    $scope.searchText = "";
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
            
            TasksSvc.updateTask(userId, taskObj.id, {status: newStatus} ).then(function(){
                TasksSvc.updateOpenTaskCounter(userId, openTasksIncrement)
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: message };
                });
            });
            
        };
        
        $scope.changeActiveList = function(list){
            $rootScope.activeList = list;
            $scope.loadTasksWithStatus($scope.loadedTasksStatus); 
        };
        
        $scope.changeSort = function(sortOption){
            $rootScope.activeTaskSort = sortOption;
        };

        $scope.updateTaskNameAndDesc = function(taskObj){
            $scope.response = {};
            let updatedValues = { name: taskObj.name };
            if(taskObj.desc){
                updatedValues.desc = taskObj.desc;
            }
            taskObj.goalUpdate = null;
            
            TasksSvc.updateTask(userId, taskObj.id, updatedValues).then(function(){
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.tasks.updated };
                });
            });
        };

        $scope.increaseGoal = function(task){
            if( isNaN(task.goalUpdate) ){
                $scope.response = {failed:true, message: $rootScope.i18n.tasks.notANumber };
                return;
            }

            task.goalUpdate = ( Number.isInteger(task.goalUpdate)? task.goalUpdate: Number(task.goalUpdate.toFixed(2)) ); 
            let newCurrent = task.goal.current + task.goalUpdate;
            if( newCurrent > task.goal.end ){
                $scope.response = {failed:true, message: $rootScope.i18n.tasks.incrementSurpass };
                return;
            }
            $rootScope.forceRefresh = true;
            TasksSvc.updateGoalCurrent(userId, task).then(function(){
                $rootScope.forceRefresh = null;
            });
        };
        
        $scope.decreaseGoal = function(task){
            if( isNaN(task.goalUpdate) ){
                $scope.response = {failed:true, message: $rootScope.i18n.tasks.notANumber };
                return;
            }

            task.goalUpdate = ( Number.isInteger(task.goalUpdate)? task.goalUpdate: Number(task.goalUpdate.toFixed(2)) ); 
            let newCurrent = task.goal.current - task.goalUpdate;
            if( newCurrent < 0){
                $scope.response = {failed:true, message: $rootScope.i18n.tasks.decrementSurpass };
                return;
            }
            $rootScope.forceRefresh = true;
            task.goalUpdate= task.goalUpdate *-1;
            TasksSvc.updateGoalCurrent(userId, task).then(function(){
                $rootScope.forceRefresh = null;
            });
        };

        /** TASKBOARD INITIAL LOAD */

            if(!$rootScope.visibleUserlists){
                let userInitialActiveListId = $rootScope.activeSession.preferences.lists.initialActivelistId;
                let activeListObj = undefined;
                
                /* Fetch all Visible Lists from db for the current User and set into $rootScope
                Using "onSnapshot" to listen for real time changes.*/
                var userlistsRef = ListsSvc.getVisibleListsForUser(userId);
                userlistsRef.onSnapshot(function(querySnapshot){
                    let lists = [];
                    querySnapshot.forEach(function(listDoc) {
                        lists.push(listDoc.data());
                        if(listDoc.data().id == userInitialActiveListId){
                            activeListObj = listDoc.data();
                        }
                    });

                    /* Set initial Active List */
                    if( !$rootScope.activeList ){
                        $rootScope.activeList = activeListObj;
                    }

                    /* Load Tasks for the Active List */
                    $scope.loadTasksWithStatus("open"); 
                    $scope.$apply(function(){ $rootScope.visibleUserlists = lists; });
                });
            }

            /* Set initial Task Sorting from User preferences */
            if( !$rootScope.activeTaskSort ){
                $rootScope.activeTaskSort = $rootScope.activeSession.preferences.tasks.sorting;
                $scope.reverseSort = true;
            }
        
    }]
);

memoruAngular.controller('TaskEditCtrl',
	['$rootScope','$scope','$firebaseAuth','ListsSvc','TasksSvc','AlertsSvc',
    function($rootScope,$scope,$firebaseAuth,ListsSvc,TasksSvc, AlertsSvc){
        /** METHODS */
    

        /** TASK EDIT INITIAL LOAD */
            let taskID = "";
            TasksSvc.getUserTaskByID($rootScope.activeSession.userID, taskID);
            if(!$rootScope.visibleUserlists){
                console.log("Loading Visible Tasks");
                /* Fetch all Visible Lists from db for the current User and set into $rootScope
                Using "onSnapshot" to listen for real time changes.*/
                ListsSvc.getVisibleListsForUser($rootScope.activeSession.userID).onSnapshot(function(querySnapshot){
                    let lists = [];
                    querySnapshot.forEach(function(listDoc) {
                        lists.push(listDoc.data());
                    });

                    $scope.$apply(function(){ $rootScope.visibleUserlists = lists; });
                });
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
            updateTask: function(userId, taskId, updatedValues){
                return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskId).update( updatedValues );
            },
            updateOpenTaskCounter: function(userId, increment){
                return memoruStore.collection(userTasks).doc(userId).update({
                    open: firebase.firestore.FieldValue.increment(increment)
                });
            },
            updateGoalCurrent: function(userId, taskObj){
                return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskObj.id).update({
                    "goal.current": firebase.firestore.FieldValue.increment(taskObj.goalUpdate)
                });
            },
            /** Returns a refernce to the tasks for the specified User, List and Status*/
            getTasksFromUserListWithStatus: function(userId, listId, taskStatus){
                if(listId=='archive'){
                    /** Archive list is a special type where the messages are only in status 'archived'. 
                     * The list was never changed from the original, so when tasks are unarchived, they can continue in the original list.*/
                    return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).where('status','==','archived');
                }else{
                    return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks)
                        .where('list','==',listId).where('status','==',taskStatus);
                }
            },
            moveTasktoList: function(userId, currentListId, newListId){
                const TASKS_IN_LIST = memoruStore.collection(userTasks).doc(userId).collection(ownedTasks);
                TASKS_IN_LIST.where('list', '==', currentListId).get().then(snapshots => {
                    if (snapshots.size > 0) {
                        snapshots.forEach(taskItem => {
                            TASKS_IN_LIST.doc(taskItem.id).update({ list: newListId })
                            // console.log(taskItem.data());
                        })
                    }
                })
            },
            getOpenTasksCount: function(userId){
                return memoruStore.collection(userTasks).doc(userId).get();
            }
        }
    }]
);