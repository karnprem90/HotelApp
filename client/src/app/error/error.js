
'use strict';

angular.module('errorroutes', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function($stateProvider, $urlRouterProvider, USER_ROLES) {
        console.log("nasa", USER_ROLES)
        $stateProvider
            .state('app.error', {
                url: '/error',
                templateUrl: 'app/error/404.html',
                data: {
                    authorizedRoles: [USER_ROLES.all]
                }
            })


    }]);