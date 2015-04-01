/*************************************************************************
* 
* TOP HAT VOYAGE CONFIDENTIAL
* __________________
* 
*  [2014] - [2015] Top Hat Voyage SAS - Alfred by THV
*  All Rights Reserved.
* 
* NOTICE:  All information contained herein is, and remains
* the property of Top Hat Voyage SAS and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Top Hat Voyage SAS
* and its suppliers and may be covered by French and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Top Hat Voyage SAS.
*/





'use strict';


angular.module('adminRoutes', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function($stateProvider, $urlRouterProvider, USER_ROLES) {
        console.log('kj', USER_ROLES);
        $stateProvider
            .state('adminlogin', {
                url: '/login',
                templateUrl: 'app/Administrator/login/login.html',
                controller: 'loginCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.all]
                }

            })

        .state('app.exM-account', {
                url: '/create_account',
                templateUrl: 'app/Administrator/Admin/administrator-account-creation.html',
                controller: 'adminAccountCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.admin]
                }
            })
        // .state('app.AProfile', {
        //     url: '/aprofile',
        //     templateUrl: 'app/Administrator/Admin/admin-account-visualisation.html',
        //     controller: 'adminAccountCtrl',
        //     data: {
        //         authorizedRoles: [USER_ROLES.admin]
        //     }
        // })

        .state('app.AVisualization', {
            url: '/aVisualization',
            templateUrl: 'app/Administrator/Admin/admin-account-visualisation.html',
            controller: 'adminAccountCtrl',
            data: {
                authorizedRoles: [USER_ROLES.admin]
            }
        })
        .state('app.exe_Account', {
            url: '/exe_Account',
            templateUrl: 'app/Administrator/Admin/exe_account.html',
            controller: 'adminAccountCtrl',
            data: {
                authorizedRoles: [USER_ROLES.admin]
            }
        })

        .state('app.adminsetting', {
            url: '/admin-setting',
            templateUrl: 'app/Administrator/Admin/admin-settings.html',
            controller: 'adminAccountCtrl',
            data: {
                authorizedRoles: [USER_ROLES.admin]
            }
        })

        .state('app.system-maintainance', {
            url: '/admin-maintain',
            templateUrl: 'app/Administrator/Admin/system-maintainance.html',
            data: {
                authorizedRoles: [USER_ROLES.admin]
            }
        })

        .state('app.admin-shutdown', {
                url: '/admin-system',
                templateUrl: 'app/Administrator/Admin/admin-shutdown.html',
                data: {
                    authorizedRoles: [USER_ROLES.admin]
                }

            })

        .state('app.admin-tablet', {
                url: '/admin-tablet',
                templateUrl: 'app/Administrator/Admin/admin-add-tablet.html',
                controller: 'adminAccountCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.admin]
                }

            })
        .state('forgot_password', {
                url: '/forgot_password',
                templateUrl: 'app/Administrator/login/forgotpassword.html',
                controller: 'loginCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.all]
                }


            })

    }]);