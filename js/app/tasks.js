/* The TaskCtrl controller is used to Manage User's list of tasks and Edit Task. 
 It includes actions to Create, Delete, Close and Archive tasks. 
 On Taskboard init, we need to:
    - Fetch User Visible Lists (to use in the "list selector")
    - Set the "Active List" from preferences
    - Set Task Sorting preferences 
    - Load Open tasks for the Active List
*/
memoruAngular.controller('TaskCtrl',
	['$rootScope','$scope','$routeParams','$firebaseAuth','ListsSvc','TasksSvc','AlertsSvc',
    function($rootScope,$scope,$routeParams,$firebaseAuth,ListsSvc,TasksSvc, AlertsSvc){
        
        let userId = $rootScope.activeSession.userID;
        let newTaskStatus = 'open';
        $scope.taskType = 'task';
        $scope.goalValues = { current:0};

        /** METHODS */

        /** Load tasks with specified status from the specified list. 
         * If list is not provided, then we load from active list in scope */
        $scope.loadTasksWithStatus = function(status, fromListId){
            $scope.response = {};
            $scope.loadedTasksStatus = status;
            
            if(!fromListId){
                fromListId = $rootScope.activeList.id;
            }

            let tasksListRef = TasksSvc.getTasksFromUserListWithStatus(userId, fromListId, status);
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
                // creator: userId,
                visible: true,
                createdOn: firebase.firestore.FieldValue.serverTimestamp()
            };

            //Any task created with 'All' list as the activeList, must go to 'default' list
            if( newTask.list == 'all'){
                newTask.list = 'default';
            }

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
                    taskObj.status = "deleted";
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
        
        /** An archived task should reduce the number of open tasks */
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
                    taskObj.status = newStatus;
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: message };
                });
            });
            
        };
        
        $scope.changeActiveList = function(list){
            $rootScope.activeList = list;
            $scope.loadTasksWithStatus($scope.loadedTasksStatus, $rootScope.activeList.id); 
        };
        
        $scope.changeTaskList = function(list){
            $rootScope.activeList = list;
            $scope.taskEdit.list = list.id;
        };
        
        $scope.changeSort = function(sortOption){
            $scope.activeTaskSort = sortOption;
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
        
        $scope.updateTask = function(taskObj){
            $scope.response = {};

            let duedateValue = document.querySelector('#duedateInput').value;
            if(duedateValue){
                let dateSplit = duedateValue.split("-");
                let duedate = new Date(Number(dateSplit[0]) , Number(dateSplit[1]-1) , Number(dateSplit[2]), 0,0,0);
                taskObj.duedate = firebase.firestore.Timestamp.fromDate( duedate );
            }else{
                taskObj.duedate = null; 
            }
            
            TasksSvc.updateTask(userId, taskObj.id, taskObj).then(function(){
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

        /*  Fetch all Visible Lists from db for the current User and set into $rootScope Using "onSnapshot" 
            to listen for real time changes. This is needed for both: Taskboard and TaskEdit view. */
        let loadVisibleUserLists = function (activeListId){
            let activeListObj = undefined;
                    
            ListsSvc.getVisibleListsForUser(userId).onSnapshot(function(querySnapshot){
                let lists = [];
                querySnapshot.forEach(function(listDoc) {
                    lists.push(listDoc.data());
                    if(listDoc.data().id == activeListId){
                        activeListObj = listDoc.data();
                    }
                });

                $scope.$apply(function(){ 
                    $rootScope.visibleUserlists = lists; 
                    $rootScope.activeList = activeListObj;
                });
            });
        };
        
        let loadTaskComments = function (taskId){
            let commentsRef = TasksSvc.getTaskComments(userId,taskId);
            commentsRef.onSnapshot( (querySnapshot) => {
                let comments = [];
                querySnapshot.forEach(function(doc) {
                    let comment = doc.data();
                    comment.id= doc.id;
                    comments.push(comment);
                });

                $scope.$apply(function(){
                    $scope.taskComments = comments;
                });
            });
        };

        $scope.addComment = function(){
            TasksSvc.persistTaskComment(userId, $scope.taskEdit.id, $scope.newTaskComment);
        };
        
        $scope.deleteComment = function(comment){
            TasksSvc.deleteTaskComment(userId, $scope.taskEdit.id, comment.id);
        };

        /** TASKBOARD INITIAL LOAD */
            let taskID = $routeParams.taskId;
            $scope.todayTime = new Date().getTime();
            
            if(taskID){
                /* Going to Task Edit */
                let taskReference = TasksSvc.getUserTaskByID($rootScope.activeSession.userID, taskID);
                taskReference.then( (doc) => {
                    if (doc.exists) {
                        $scope.taskEdit = doc.data();
                        if(doc.data().duedate){
                            $scope.tempDuedate = doc.data().duedate.toDate();
                        }
                        loadVisibleUserLists($scope.taskEdit.list);
                        loadTaskComments($scope.taskEdit.id);
                    } else {
                        // doc.data() will be undefined in this case
                        console.error("Task doesn't exist!");
                    }
                }).catch((error) => {
                    console.error("Error getting document:", error);
                });
            }else{
                $scope.activeTaskSort = $rootScope.activeSession.preferences.tasks.sorting;
                $scope.reverseSort = true;
                let preferredActiveListId = $rootScope.activeSession.preferences.lists.initialActivelistId;
                loadVisibleUserLists(preferredActiveListId);
                $scope.loadTasksWithStatus("open",preferredActiveListId);
            }
        
    }]
);

memoruAngular.factory('TasksSvc',
    ['$rootScope',
	function($rootScope){
        let userTasks = memoruConstants.db.collections.userTasks;
        let ownedTasks = memoruConstants.db.collections.ownedTasks;
        
        return{
            getUserTaskByID: function(userId, taskId){
                return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskId).get(); 
            },
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
                }else
                if(listId=='all'){
                    /** Fetch only visible tasks, to avoid showing taks for list that are supposed to be secret */
                    return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).where('status','==',taskStatus).where('visible','==',true);
                }else{
                    return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).where('list','==',listId).where('status','==',taskStatus);
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
            changeTaskVisibility: function(userId, currentListId, isVisible){
                const TASKS_IN_LIST = memoruStore.collection(userTasks).doc(userId).collection(ownedTasks);
                TASKS_IN_LIST.where('list', '==', currentListId).get().then(snapshots => {
                    if (snapshots.size > 0) {
                        snapshots.forEach(taskItem => {
                            TASKS_IN_LIST.doc(taskItem.id).update({ visible: isVisible })
                        })
                    }
                })
            },
            getOpenTasksCount: function(userId){
                return memoruStore.collection(userTasks).doc(userId);
            },
            getTaskComments: function(userId,taskId){
                return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskId).collection("comments");
            },
            persistTaskComment: function(userId, taskId, comment){
                memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskId).collection("comments").add({
                    text: comment, date: firebase.firestore.FieldValue.serverTimestamp()
                });
                memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskId).update({
                    "comments": firebase.firestore.FieldValue.increment(1)
                })
            }, 
            deleteTaskComment: function(userId, taskId, commentId){
                memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskId).collection("comments").doc(commentId).delete();
                memoruStore.collection(userTasks).doc(userId).collection(ownedTasks).doc(taskId).update({
                    "comments": firebase.firestore.FieldValue.increment(-1)
                })
            } 
        }
    }]
);