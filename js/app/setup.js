var memoruApp = angular.module('memoruApp',[]);

//Set some constants on the Angular root scope
memoruApp.run(function($rootScope) {
	$rootScope.appConstants = {
        app:{name:"Memoru", version: "1.0"}
    };

    $rootScope.i18n = {
        menu:{login:"Log in", logout: "Log out", register:"Register"},
        labels:{tasks:"Tasks"}
    };

});