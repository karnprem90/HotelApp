angular.module('execRoutes', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function($stateProvider, $urlRouterProvider, USER_ROLES) {

        $stateProvider
            .state('app.edashboard', {
                url: '/exex_dash',
                templateUrl: 'app/ExecutiveManager/executiveManager/dashboard.html',
                data: {
                    authorizedRoles: [USER_ROLES.emanager]
                }
            })
            .state('elogin', {
                url: '/em_login',
                templateUrl: 'app/ExecutiveManager/login/login.html',
                controller: 'emloginCtrl'
            })
            .state('app.EMProfile', {
                url: '/emProfile',
                templateUrl: 'app/ExecutiveManager/executiveManager/execMgrAccVis.html',
                controller: 'exeMgrCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.emanager]
                }
            })

            .state('app.execMgrSettings', {
                url: '/settings',
                templateUrl: 'app/ExecutiveManager/executiveManager/execMgr-settings.html',
                controller: 'exeMgrCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.emanager]
                }
            })

            .state('app.execAccount', {
                url: '/account-creation',
                templateUrl: 'app/ExecutiveManager/executiveManager/exec-account-creation.html',
                controller: 'exeMgrCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.emanager]
                }
            })

            .state('app.hotelMgrAccount', {
                    url: '/hotelMgrAccountCreation',
                    templateUrl: 'app/ExecutiveManager/executiveManager/hotel-manager-acc-creation.html',
                    controller: 'exeMgrCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

            .state('app.logisticAgentAccount', {
                url: '/logistic_account-creation',
                templateUrl: 'app/ExecutiveManager/executiveManager/logistic-account-creation.html',
                controller: 'exeMgrCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.emanager]
                }
            })

            .state('app.serviceSuppliserAccount', {
                    url: '/service_supplier_account-creation',
                    templateUrl: 'app/ExecutiveManager/executiveManager/service-supplier-account-creation.html',
                    controller: 'exeMgrCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

            .state('app.hotelAccount', {
                    url: '/hotel_accCreate',
                    templateUrl: 'app/ExecutiveManager/executiveManager/hotel-account-creation.html',
                    controller: 'exeMgrCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

            .state('app.hotelList', {
                    url: '/hotel_list',
                    templateUrl: 'app/ExecutiveManager/lists/hotels-list.html',
                    controller: 'listCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

            .state('app.suppliersList', {
                    url: '/suppliers_list',
                    templateUrl: 'app/ExecutiveManager/lists/suppliers_list.html',
                    controller: 'listCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

            .state('app.managersList', {
                    url: '/managers_list',
                    templateUrl: 'app/ExecutiveManager/lists/hotel_managers_list.html',
                    controller: 'listCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

            .state('app.zonesList', {
                    url: '/zones_list',
                    templateUrl: 'app/ExecutiveManager/lists/zones_list.html',
                    controller: 'listCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

            .state('app.logisticAgentsList', {
                    url: '/logistic_agents_list',
                    templateUrl: 'app/ExecutiveManager/lists/logistic_agents_list.html',
                    controller: 'listCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

            .state('app.EMAccounts', {
                    url: '/EMAccounts',
                    templateUrl: 'app/ExecutiveManager/executiveManager/accounts.html',
                    controller: 'exeMgrCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })
            .state('app.EMTablets', {
                    url: '/EMTablets',
                    templateUrl: 'app/ExecutiveManager/executiveManager/emTablet.html',
                    controller: 'exeMgrCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.emanager]
                    }
            })

    }]);