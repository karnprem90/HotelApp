'use strict';


app.controller('zoneMgrAccCtrl', ['$scope', '$http', '$location', 'AuthServ', 'growl',
    function ($scope, $http, $location, AuthServ, growl) {

        // $scope.acclist = function(){
        //     $scope.user = AuthServ.getUser();
        //         $http.get('/executiveManager',{headers: AuthServ.getAuthHeader()})
        //         .success(function (data, status) {
        //           $scope.acct_list = data;
        //         })
        //        .error(function (data, status) {
        //          growl.addErrorMessage(data);
        //         });
        // }
        var _scope = {};
        _scope.init = function (){
            getHoteIdlist();
            getZonelist();
        }
        var getHoteIdlist = function () {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getHotelList', {headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        $scope.hotelName = data;
                        console.log(data);
                        // $scope.zones = $scope.zones.shift();
                    });
            }
        }

        $scope.hotelMgrAccount = function (account_data) {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.post('/createHotelManager', account_data, {headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        console.log(data);
                        $location.path('app');
                        growl.success('Account has been created');
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });
            }
        }




        // $scope.createhotelAccount = function (account_data) {
        //     $scope.user = AuthServ.getUser();
        //     if ($scope.user) {
        //         $http.post('/createHotel', account_data, {headers: AuthServ.getAuthHeader()})
        //             .success(function (data, status) {
        //                 console.log(data);
        //                 $location.path('app');
        //                 growl.success('Account has been created');
        //             })
        //             .error(function (data, status) {
        //                 growl.error(data.message);
        //             });
        //     }
        // }


        $scope.createServiceSupplierAcc = function(account_data) {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.post('/createSupplier', account_data, { headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        console.log(data);
                        $location.path('app/supplier_list');
                        growl.success('Account has been created');
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });
            }
        }

        var getZonelist = function() {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getZoneList', {headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        $scope.zones = [];
                        angular.forEach(data, function(value, key) {
                                value._id = value._id.toString();
                                $scope.zones.push(value);
                        })
                            // $scope.zones = $scope.zones.shift();
                    });
            }
        }
        _scope.init();
    }
]);