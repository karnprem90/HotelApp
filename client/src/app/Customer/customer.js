'use strict';


angular.module('customerRoutes', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function ($stateProvider, $urlRouterProvider, USER_ROLES) {

        $stateProvider
            .state('app.CProfile', {
                url: '/cProfile',
                templateUrl: 'app/Customer/cutomerAccount/customer-account-visualisation.html',
                controller: 'cutomAccCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.customer]
                }
            })
    }]);