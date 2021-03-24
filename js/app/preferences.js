/** ##### PREFERENCES ##### **/
memoruAngular.controller('PreferencesCtrl',
	['$rootScope','$scope','UserSvc','ListsSvc',
    function($rootScope,$scope,UserSvc,ListsSvc){

		/** User preferences are loaded from Firebase, during onAuthStateChanged (auth ctrl) */
		firebase.auth().onAuthStateChanged((user) => {
			if(!user)return;
			ListsSvc.getVisibleListsForUser(user.uid).onSnapshot(function(querySnapshot){
				let lists = [];
				let activeListObj = undefined;    
				let activeListId = $rootScope.activeSession.preferences.lists.initialActivelistId;
	
				querySnapshot.forEach(function(listDoc) {
					lists.push(listDoc.data());
					if(listDoc.data().id == activeListId){
						activeListObj = listDoc.data();
					}
				});
	
				$scope.$apply(function(){ 
					$scope.visibleUserlists = lists; 
					$scope.activeList = activeListObj;
				});
			});
			
		});

		
		$scope.changeInitialList = function(list){
			$scope.activeList = list;
			$rootScope.activeSession.preferences.lists.initialActivelistId = list.id;
		};
		
		$scope.changeInitialSort = function(sort){
			$rootScope.activeSession.preferences.tasks.sorting.field = sort.field;
			$rootScope.activeSession.preferences.tasks.sorting.desc = sort.desc;
		};
		
		$scope.savePreferences = function(){
			if(!$rootScope.activeSession.preferences.goals.showBar){
				$rootScope.activeSession.preferences.goals.showProgress = false;
			}
			UserSvc.updateUserPreferences($rootScope.activeSession.userID, $rootScope.activeSession.preferences).then(function(){
				$scope.$apply(function(){
					$scope.response = {success:true, message: $rootScope.i18n.pref.saved };
				});
			});
		}

    }]
);