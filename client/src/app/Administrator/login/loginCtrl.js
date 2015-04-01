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

angular.module('adminRoutes')
    .controller('loginCtrl', ['$scope',  '$http',  '$location', 'AuthServ', 'growl',
        function ($scope, $http, $location, AuthServ, growl) {
            $scope.loginForm = {
                remember: true
            };
            $scope.user = {};
            $scope.authError = null;
            $scope.login = function (user) {
                $http.post('/login', user)
                    .success(function (data, status) {
                        AuthServ.setUserToken(data, $scope.loginForm.remember);
                        $location.path('app');
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });

            }

            $scope.forgotPassword = function (email_add) {
                    $http.post('/forgetPassword', {username:email_add})
                        .success(function (data, status) {
                            console.log(data);
                            growl.success('Your New Password has been send to your Email');
                            $location.path('/login');
                        })
                        .error(function (data, status) {
                            growl.error(data.message);
                        })
            }

    }]);