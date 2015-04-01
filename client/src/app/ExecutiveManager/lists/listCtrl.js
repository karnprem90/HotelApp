'use strict';

app.controller('listCtrl', ['$scope', '$http', '$location', 'AuthServ', 'growl',
    function ($scope, $http, $location, AuthServ, growl) {

        var _scope = {};
        _scope.init = function (){
            $scope.listView = true;   
            getZonelist();
            $scope.titles = [{
                name: 'Mr'
            }, {
                name: 'Ms'
            }];
        }

        var getZonelist = function () {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getZoneList', {headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        $scope.zones = [];
                        angular.forEach(data, function(value, key) {
                                value._id = value._id.toString();
                                $scope.zones.push(value);
                        })
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });
            }
        }

        $scope.getSupplierslist = function (zoneId) {
            $scope.zId = zoneId;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getSupplierList/'+zoneId , {
                    headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        $scope.suppliers_list = data;
                        // console.log(data);
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });
            }
        }

        $scope.getHotelList = function(zoneId){
            $scope.zId = zoneId;
            $scope.user = AuthServ.getUser();
            if(zoneId != undefined){
                $http.get('/getHotelList/'+zoneId, {
                headers: AuthServ.getAuthHeader()})
                .success(function (data, status) {
                  $scope.hotel_list = data;
                })
                .error(function (data, status) {
                  growl.error(data.message);
                });

            }
        }


        $scope.getManagersList = function (zoneId) {
            $scope.zId = zoneId;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getHotelManagerList/'+zoneId , {
                    headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        $scope.managers_list = data;
                        // console.log(data);
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });
            }
        }

        $scope.getAgentsList = function (zoneId) {
            $scope.zId = zoneId;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getLogisticAgentByZone/'+zoneId , {
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
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });
            }
        }


        $scope.updateZoneDetails = function (account_data){
            var zId = account_data._id;
            delete account_data._id;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.put('/updateZoneName/'+ zId, account_data, { 
                    headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        growl.success("Zone details has been updated");
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    })
            }
        }

        $scope.updateHotelDetails = function (account_data) {
            delete account_data.hotelId;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.put('/updateHotel/'+ $scope.zId, account_data, { 
                    headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        growl.success("Hotel details has been updated");
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    })
            }
        }

        $scope.updateHotelManager = function (account_data) {
            var hotelId = account_data.hotelId;
            delete account_data._id, delete account_data.__v,
            delete account_data.zoneId, delete account_data.hotelId;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {

                $http.put('/updateHotelManager/'+ hotelId + '/'+ $scope.zId, account_data, { 
                    headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        console.log(data);
                        $scope.getSupplierslist($scope.zId);
                        growl.success("Account has been updated");
                        $scope.listView = true;
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    })
            }
        }

        $scope.updateLogisticAgentDetails = function (account_data) {
            var userId = account_data._id;
            delete account_data._id, delete account_data.__v,
            delete account_data.zones;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {

                $http.put('/updateLogisticAgent/'+ userId, account_data, { 
                    headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        growl.success("Account has been updated");
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    })
            }
        }

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
                        $scope.getSupplierslist($scope.zId);
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