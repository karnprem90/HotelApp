angular.module('ServiceRoutes', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function($stateProvider, $urlRouterProvider, USER_ROLES) {

        $stateProvider



            .state('app.SSProfile', {
                url: '/ssProfile',
                templateUrl: 'app/ServiceSupplier/Service/supplier_account-visualisation.html',
                controller: 'suppAccCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.supplier]
                }
            })
            .state('app.service_setting', {
                url: '/service_setting',
                templateUrl: 'app/ServiceSupplier/Service/service-supplier-settings.html',
                controller: 'suppAccCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.supplier]
                }
            })

            .state('app.product-details', {
                url: '/product-details',
                templateUrl: 'app/ServiceSupplier/Service/service-supplier-product-details.html',
                controller: 'suppAccCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.supplier]
                }
            })


        .state('app.service_stock', {
            url: '/service_stock',
            templateUrl: 'app/ServiceSupplier/Service/service-supplier-stocks.html',
            data: {
                authorizedRoles: [USER_ROLES.supplier]
            }
        })

        .state('app.service_done', {
                url: '/service_done',
                templateUrl: 'app/ServiceSupplier/Service/service-supplier-transaction-done.html',
                data: {
                    authorizedRoles: [USER_ROLES.supplier]
                }
            })
            .state('app.service_pending', {
                url: '/service_pending',
                templateUrl: 'app/ServiceSupplier/Service/service-supplier-transaction-pending.html',
                data: {
                    authorizedRoles: [USER_ROLES.supplier]
                }
            })
            .state('app.service_sidebar', {
                url: '/service_sidebar',
                templateUrl: 'app/ServiceSupplier/service-supplier-sidebar.html',
                data: {
                    authorizedRoles: [USER_ROLES.supplier]
                }
            })
            .state('serviceLogin', {
                url: '/service-login',
                templateUrl: 'app/ServiceSupplier/login/login.html',
                controller: 'suloginCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.supplier]
                }
            })
    }]);