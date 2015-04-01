'use strict';

angular.module('hotelUserRoutes', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function($stateProvider, $urlRouterProvider, USER_ROLES) {
        console.log('kj', USER_ROLES);
        $stateProvider
            .state('app.HUProfile', {
                url: '/huProfile',
                templateUrl: 'app/HotelUser/Account/hotel-user-account_visualisation.html',
                controller: 'hotelUsrCtrl',
                data: {
                    authorizedRoles: [USER_ROLES.hoteluser]
                }

            })

    }]);