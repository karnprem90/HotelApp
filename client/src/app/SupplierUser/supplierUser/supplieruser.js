angular.module('supplierUserRoutes', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function($stateProvider, $urlRouterProvider, USER_ROLES) {

        $stateProvider

            .state('app.serviceuser_setting', {
                url: '/serviceuser_setting',
                templateUrl: 'app/SupplierUser/supplierUser/supplier-user-setting.html',
                controller: 'supplierUserCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.supplieruser]
                }
            })

    }]);