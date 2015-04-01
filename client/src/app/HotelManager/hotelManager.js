'use strict';


angular.module('hotelRoutes',['cons'])
.config(['$stateProvider', '$urlRouterProvider','USER_ROLES', function ($stateProvider, $urlRouterProvider,USER_ROLES) {

    $stateProvider 
        .state('app.hotel-manager-guest', {
            url: '/hotelManager_guest',
            templateUrl: 'app/HotelManager/Hotel/hotel-manager-guest-account-creation.html',
            controller:'hmCtrl',
            data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })

        .state('app.HMProfile', {
            url: '/hmProfile',
            templateUrl: 'app/HotelManager/Hotel/hmacc_visualisation.html',
            controller:'hmCtrl',
             data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })

        .state('app.check-in', {
            url: '/check-in-details',
            templateUrl: 'app/HotelManager/Hotel/check-in-details.html',
            controller:'hmCtrl',
             data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })

        .state('app.check-out', {
            url: '/check-out-details',
            templateUrl: 'app/HotelManager/Hotel/check-out-details.html',
            controller:'hmCtrl',
             data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })
        
        .state('app.HManager_setting', {
            url: '/hotel-setting',
            templateUrl: 'app/HotelManager/Hotel/hotel-manager-settings.html',
            controller:'hmCtrl',
            data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })

         .state('app.hoteluser_acc', {
            url: '/hoteluser_acc',
            templateUrl: 'app/HotelManager/Hotel/hotel_user-account-creation.html',
            controller:'hmCtrl',
             data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })


        .state('app.HManager_current-message', {
            url: '/current-message',
            templateUrl: 'app/HotelManager/Hotel/current-message.html',
            data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })
       
        .state('app.HManager_status', {
            url: '/hotelManager_status',
            templateUrl: 'app/HotelManager/Hotel/hotel-manager-tablet-stats.html',
            data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })
        
        .state('app.transaction-done', {
            url: '/hotelManager_transaction',
            templateUrl: 'app/HotelManager/Hotel/hotelmanager-transaction-done.html',
            data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })
        
        .state('app.transaction-pending', {
            url: '/hotelManager_transaction-pending',
            templateUrl: 'app/HotelManager/Hotel/hotelmanager-transaction-pending.html',
            data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })

        .state('app.hotel_sidebar', {
            url: '/hotel_sidebar',
            templateUrl: 'app/HotelManager/hotelmgr-sidebar.html',
            data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        })
        .state('hotelLogin', {
            url: '/hotel-login',
            templateUrl: 'app/HotelManager/login/login.html',
            controller:'hmloginCtrl',
            data: {
             authorizedRoles: [USER_ROLES.hmanager]
            }
        }) 
}]);