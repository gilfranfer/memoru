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
        $scope.loadTasksWithStatus = function(status){
            $rootScope.loadedTasksStatus = status;

            let tasksListRef = TasksSvc.getTasksFromUserListWithStatus($rootScope.activeSession.userID, $rootScope.activeList, status );
            tasksListRef.onSnapshot(function(querySnapshot){
                let tasks = [];
                
                if(querySnapshot.metadata.hasPendingWrites){return;}
                querySnapshot.forEach(function(doc) {
                    // var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
                    // console.log(source, " data: ", doc.data());
                    tasks.push(doc.data());
                });
                console.log(tasks);
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
                list: $rootScope.activeList,
                type: $scope.taskType,
                creator: userId,
                createdOn: firebase.firestore.FieldValue.serverTimestamp()
            };
            // console.debug(newTask);
            
            TasksSvc.persistTaskForUser(newTask, userId).then(function(){
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.tasks.created };
                });
            });
        };
        
        $scope.deleteTask = function(taskObj){
            $scope.response = {};
            
            TasksSvc.deleteUserTask(taskObj, userId).then(function(){
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.tasks.deleted };
                });
            });
        };
        
        /** TASKBOARD INITIAL LOAD */
        

            /* Fetch all Visible Lists from db for the current User and set into $rootScope
            Using "onSnapshot" to listen for real time changes.*/
            if(!$rootScope.visibleUserlists){
                var userlistsRef = ListsSvc.getVisibleListsForUser(userId);
                userlistsRef.onSnapshot(function(querySnapshot){
                    let lists = [];
                    querySnapshot.forEach(function(doc) {
                        lists.push(doc.data());
                        console.debug("List:",doc.data().name);
                    });

                    $scope.$apply(function(){
                        $rootScope.visibleUserlists = lists;
                    });
                });
            }

            /* Set initial Active List from User preferences */
            if( !$rootScope.activeList ){
                $rootScope.activeList = $rootScope.activeSession.preferences.lists.selected;
            }

            /* Set initial Task Sorting from User preferences */
            if( !$rootScope.taskSortConfig ){
                $rootScope.taskSortConfig = $rootScope.activeSession.preferences.tasks.sorting;
            }

            /* Load Open Tasks in Active List */
            $scope.loadTasksWithStatus("open");           
        
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
            /** Returns a refernce to the tasks for the specified User, List and Status*/
            getTasksFromUserListWithStatus: function(userId, listId, taskStatus){
                return memoruStore.collection(userTasks).doc(userId).collection(ownedTasks)
                    .where('list','==',listId).where('status','==',taskStatus);
            }
        }
    }]
);