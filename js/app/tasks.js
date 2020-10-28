/* The Taskboard controller is used to Manage User's list of tasks.
It includes actions to Create, Delete, Close and Archive tasks. */
memoruAngular.controller('TaskboardCtrl',
	['$rootScope','$scope','$firebaseAuth','ListsSvc','TasksSvc','AlertsSvc',
    function($rootScope,$scope,$firebaseAuth,ListsSvc,TasksSvc, AlertsSvc){

        /* On Taskboard load, we need to load 
        1. All the User's list, for the "list selector"
        2. Task Sorting preferences
        3. Tasks from the currently selected List */
        
        /* Set initial Task Sorting from User preferences */
        if( !$rootScope.taskSortConfig ){
            $rootScope.taskSortConfig = $rootScope.activeSession.preferences.tasks.sorting;
        }

        /* Set initial Active List from User preferences */
        if( !$rootScope.activeList ){
			$rootScope.activeList = $rootScope.activeSession.preferences.lists.selected;
        }
        
        /* TODO: This code is the same in ListsCtrl. I could move both to a sinlge controller */
        /* Fetch all Lists from db for the current User and set into $rootScope
            Using "onSnapshot" to listen for real time changes.*/
        let userId = $rootScope.activeSession.userID;
        if(!$rootScope.userlists){
            var userlistsRef = ListsSvc.getListsCollectionForUser(userId);
            userlistsRef.onSnapshot(function(querySnapshot){
                let lists = [];
                querySnapshot.forEach(function(doc) {
                    lists.push(doc.data());
                    console.log("List:",doc.data().name);
                });

                $scope.$apply(function(){
                    $rootScope.userlists = lists;
                });
            });
        }
        
        $scope.newTask = {status:'open'};
        $scope.addTask = function(){
            $scope.response = {};
            $scope.newTask.list = $rootScope.activeList;
            $scope.newTask.creator = $rootScope.activeSession.username;
            $scope.newTask.createrId = $rootScope.activeSession.userID;
            $scope.newTask.createdOn = firebase.firestore.FieldValue.serverTimestamp();
            console.log($scope.newTask);
            TasksSvc.persistTaskForUser($scope.newTask,userId).then(function(){
                $scope.newTask = {status:'open'};
                $scope.$apply(function(){
                    $scope.response = {success:true, title: AlertsSvc.getRandomSuccessTitle(), message: $rootScope.i18n.tasks.created };
                });
            });
        };
        
    }]
);


let task = {
    id: "",
    name:"Code Memoru",
    desc:"Code an application for Collaborative to-do list",
    status:"Pending (2) | Review (1) | Completed (0)",
    wasAssigned: false,
    creation:{id:"", name:"", on:""},
    completion:{id:"", name:"", on:""},
    deletion:{id:"", name:"", on:""},
    archival:{id:"", name:"", on:""},
    review:{id:"", name:"", on:""},
    subtasks:[],
    comments:[],
    fromList:"List ID"
};

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
        }
    }]
);