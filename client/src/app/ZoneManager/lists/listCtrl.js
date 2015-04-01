'use strict';

app.controller('zmListCtrl', ['$scope', '$http', '$location', 'AuthServ', 'growl',
    function ($scope, $http, $location, AuthServ, growl) {

        var _scope = {};
        _scope.init = function (){
            $scope.listView = true;
            getSupplierslist();
            getHotelManagerslist();
            getAgentsList();
            $scope.titles = [{
                name: 'Mr'
            }, {
                name: 'Ms'
            }];
        }

        var getHotelManagerslist = function () {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getHotelManagerList', {headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        $scope.managers_list = data;
                        // console.log(data);
                    });
            }
        }

        var getSupplierslist = function () {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getSupplierList', {headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        $scope.suppliers_list = data;
                        // console.log(data);
                    });
            }
        }

        var getAgentsList = function () {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getLogisticAgentByZone' , {
                    headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        $scope.agents_list = data;
                        // console.log(data);
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });
            }
        }

        $scope.getSuppliersInfo = function (id) {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getSupplier/'+id, {headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        $scope.supplier = data;
                        $scope.listView = false;
                        // console.log(data);
                    });
            }
        }

        $scope.updateHotelManager = function(account_data) {
            var hotelId = account_data.hotelId;
            delete account_data._id, delete account_data.__v,
            delete account_data.hotelId, delete account_data.zoneId;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.put('/updateHotelManager/'+ hotelId, account_data, {
                            headers: AuthServ.getAuthHeader()
                        })
                        .success(function (data, status) {
                            console.log(data);
                            getSupplierslist();
                            growl.success("Account has been updated");
                            $scope.listView = true;
                        })
                        .error(function (data, status) {
                            growl.error(data.message);
                        })
              
            }
        };

        $scope.updateSupplierDetails = function (account_data) {
            var userId = account_data._id;
            delete account_data._id, delete account_data.dateOfCreation, delete account_data.exceptionalOpening, delete account_data.dayOff,
            delete account_data.holidays, delete account_data.workingTime, delete account_data.contacts, delete account_data.__v
            $scope.user = AuthServ.getUser();
            if ($scope.user) {

                $http.put('/updateSupplier/'+ userId, account_data, { 
                    headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        console.log(data);
                        getSupplierslist();
                        growl.success("Account has been updated");
                        $scope.listView = true;
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    })
            }
        }

        //validations
        $scope.checkName = function (data, field) {
            var INTEGER_REGEXP = /[^a-zA-Z ]/;
            if (angular.isUndefined(data) || data == '') {
                return "name is required.";
            } else if (INTEGER_REGEXP.test(data)) {
                return 'Enter Text only';
            }
        };


        $scope.checkPhone = function (data, field) {
            var INTEGER_REGEXP = /[^0-9]+/;
            if (angular.isUndefined(data) || data == '') {
                return "Number is required.";
            } else if (INTEGER_REGEXP.test(data)) {
                return 'Enter Numbers only';
            }
        };

        _scope.init();
    }
]);