'use strict';


angular.module('LogisticRoutes', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function ($stateProvider, $urlRouterProvider, USER_ROLES) {

        $stateProvider
            .state('app.delivery_pending', {
                url: '/delivery_pending',
                templateUrl: 'app/LogisticAgent/Logistic/delivery-peniding-pop-up.html',
                data: {
                    authorizedRoles: [USER_ROLES.agent]
                }
            })

        .state('app.stock', {
            url: '/stock',
            templateUrl: 'app/LogisticAgent/Logistic/stocks.html',
            data: {
                authorizedRoles: [USER_ROLES.agent]
            }
        })

        .state('app.LAProfile', {
            url: '/laProfile',
            templateUrl: 'app/LogisticAgent/Logistic/logis-acctvisualisation.html',
            controller: 'logisticAccCtrl',
            data: {
                authorizedRoles: [USER_ROLES.agent]
            }
        })

        .state('app.logtransaction-pending', {
            url: '/deliver_pending',
            templateUrl: 'app/LogisticAgent/Logistic/zonelogicsticagent-deliveries-pending.html',
            data: {
                authorizedRoles: [USER_ROLES.agent]
            }
        })

        .state('app.logtransaction-done', {
            url: '/deliver_done',
            templateUrl: 'app/LogisticAgent/Logistic/zonelogicsticagent-delivery-done.html',
            data: {
                authorizedRoles: [USER_ROLES.agent]
            }
        })

        .state('app.logistic-setting', {
                url: '/setting',
                templateUrl: 'app/LogisticAgent/Logistic/zonelogicsticagent-settings.html',
                data: {
                    authorizedRoles: [USER_ROLES.agent]
                }
            })
            .state('app.logistic_sidebar', {
                url: '/logistic_sidebar',
                templateUrl: 'app/LogisticAgent/logistic-agent-sidebar.html',
                data: {
                    authorizedRoles: [USER_ROLES.agent]
                }
            })
            .state('logisticLogin', {
                url: '/logistic-login',
                templateUrl: 'app/LogisticAgent/login/login.html',
                controller: 'laloginCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.agent]
                }
            })
    }]);