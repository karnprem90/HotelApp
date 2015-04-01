'use strict';

app.controller('exeMgrCtrl', ['$scope', '$http', '$location', 'AuthServ',
    'growl', '$stateParams', '$modal', '$log',
    function ($scope, $http, $location, AuthServ, growl, $stateParams, $modal, $log) {
        var _scope = {};
        _scope.init = function() {
            $scope.submit = false;
            getAcclist();
            getCountrysList();
            getLanguagesList();
            getZonelist();
            // $scope.getLogZoneAcclist();
        }
        var getZonelist = function() {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getZoneList', {
                        headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        $scope.zones = [];
                        angular.forEach(data, function(value, key) {
                                value._id = value._id.toString();
                                $scope.zones.push(value);
                                console.log($scope.zones);
                            })
                            // $scope.zones = $scope.zones.shift();
                    });
            }
        }

        var getAcclist = function() {
            $scope.user = AuthServ.getUser();
            $http.get('/getExecutiveManager', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.acct_info = data;
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }

        var getCountrysList = function (){
            $scope.user = AuthServ.getUser();
            $http.get('/getCountryList', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.countriesList = data;
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }

        $scope.getTabletlist = function (){
            $scope.user = AuthServ.getUser();
            $http.get('/getTabletList', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.tabletList = data;
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }

         $scope.selectTablet = function(row) {
          $scope.selectedRow = row;
        };

        var getLanguagesList = function (){
            $scope.user = AuthServ.getUser();
            $http.get('/getLanguageList', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.languagesList = data;
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }

       $scope.getLogZoneAcclist = function() {
            $scope.user = AuthServ.getUser();
            $http.get('/getAllLogisticAgentZoneManager', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.acct_list = data;
                    console.log('logistic', $scope.acct_list);
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }


        // var getZoneAcclist = function() {
        //     $scope.user = AuthServ.getUser();
        //     $http.get('/getZoneManagerList', {
        //             headers: AuthServ.getAuthHeader()
        //         })
        //         .success(function(data, status) {
        //             $scope.acct_list = data;
        //             console.log('zone',$scope.acct_list);
        //         })
        // }

        $scope.updateAccount = function (account_data, valid) {
            $scope.submit = false;
            if(valid){
                $scope.user = AuthServ.getUser();
                if ($scope.user) {
                    delete account_data._id;
                    delete account_data.__v;
                    delete account_data.email;

                    $http.put('/updateExecutiveManager', account_data, {headers: AuthServ.getAuthHeader()})
                        .success(function (data, status) {
                            console.log(data);
                            getAcclist();
                            $scope.submit = false;
                            growl.success('Your account has been successfully updated');
                        })
                        .error(function (data, status) {
                            growl.error(data.message);
                        });
                } 
            } else {
                $scope.submit = true;
            }
            
        }

        $scope.changeAccountPassword = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'changePwdModal.html',
                controller: 'changePwdModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function() {

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }


        // $scope.createServiceSupplierAcc = function(account_data) {
        //     $scope.user = AuthServ.getUser();
        //     if ($scope.user) {
        //         $http.post('/createSupplierByExecutiveMgr', account_data, { headers: AuthServ.getAuthHeader()})
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



        $scope.getHoteIdlist = function(id) {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.get('/getHotelList/' + id, {
                        headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        $scope.hotelName = data;
                        console.log(data);
                        // $scope.zones = $scope.zones.shift();
                    });
            }
        }

        //new account modal

        $scope.newAccount = function(size, view) {
            if(view == 'new')
                $scope.view = 'create';
            else 
                $scope.view = 'view';
            var modalInstance = $modal.open({
                templateUrl: 'newAccountmodal.html',
                controller: 'accountModalInstanceCtrl',
                size: size,
                resolve: {
                    account_scope: function() {
                        return $scope.view;
                    },
                    account_info:function() { 
                        if(view == 'new')
                            return $scope.accInfo = undefined;
                        else
                            return $scope.accInfo;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.getLogZoneAcclist();

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        //get account information
        $scope.getAccountInfo = function (accDetails) {
            $scope.accInfo = accDetails;
            $scope.newAccount('md', 'view');
        }

        // zone name modal

        $scope.zoneName = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'zonemodal.html',
                controller: 'zoneModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function() {}, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        _scope.init();
    }
]);

var accountModalInstanceCtrl = function($scope, $modalInstance, 
    AuthServ, $http, $location, growl, account_scope, account_info) {
    $scope.view = account_scope;
    $scope.createProfile = account_info;
    var _scope = {};
    _scope.init = function() {
        getZonelist();
        getCountrysList();
        getLanguagesList();
    }

    $scope.changeViewScope = function () {
        $scope.view = 'edit';
    }

    var getCountrysList = function (){
        $scope.user = AuthServ.getUser();
        $http.get('/getCountryList', {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.countriesList = data;
            })
            .error(function (data, status) {
                growl.error(data.message);
            });
    }

    var getLanguagesList = function (){
        $scope.user = AuthServ.getUser();
        $http.get('/getLanguageList', {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.languagesList = data;
            })
            .error(function (data, status) {
                growl.error(data.message);
            });
    }


    $scope.createLogisticAccount = function(account_data) {
        $scope.submitted = true;
        delete account_data.title;
        $scope.user = AuthServ.getUser();
        getObject(account_data);
        if ($scope.user) {

            $http.post('/createLogisticAgent', account_data, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    console.log(data);
                    account_data = data;
                    $modalInstance.close(account_data);
                    growl.success('Logistic Agent account has been successfully created')
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }
    }

    $scope.createAccount = function(account_data) {
        $scope.submitted = true;
        delete account_data.title;
        console.log(account_data);
        $scope.user = AuthServ.getUser();
        getObject(account_data);
        if ($scope.user) {

            $http.post('/createZoneManager', account_data, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    console.log(data);
                    account_data = data;
                    $modalInstance.close(account_data);
                    growl.success('Zone Manager account has been successfully created');
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }
    }

    $scope.updatelogisticAccount = function(account_data) {
        $scope.submitted = true;
        var id = account_data._id;
        delete account_data.title, delete account_data.email,
        delete account_data.Imageurl, delete account_data.zones,
        delete account_data._id;
        $scope.user = AuthServ.getUser();
        getObject(account_data);
        if ($scope.user) {

            $http.put('/updateLogisticAgent/'+ id, account_data, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    console.log(data);
                    account_data = data;
                    $modalInstance.close(account_data);
                    growl.success('Logistic Agent account has been successfully updated')
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }
    }

    $scope.updateZMAccount = function(account_data) {
        $scope.submitted = true;
        var id = account_data._id;
        delete account_data.title, delete account_data.email,
        delete account_data.Imageurl, delete account_data.zone,
        delete account_data._id;
        $scope.user = AuthServ.getUser();
        getObject(account_data);
        if ($scope.user) {

            $http.put('/updateZoneManager/'+ id, account_data, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    console.log(data);
                    account_data = data;
                    $modalInstance.close(account_data);
                    growl.success('Zone Manager account has been successfully updated')
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }
    }

    var getZonelist = function() {
        $scope.user = AuthServ.getUser();
        if ($scope.user) {
            $http.get('/getZoneList', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.zones = [];
                    angular.forEach(data, function(value, key) {
                            value._id = value._id.toString();
                            $scope.zones.push(value);
                            console.log($scope.zones);
                        })
                        // $scope.zones = $scope.zones.shift();
                });
        }
    }

    function getObject(theObject) {
        var result = null;
        if(theObject instanceof Array) {
            for(var i = 0; i < theObject.length; i++) {
             result = getObject(theObject[i]);
        }
        }
        else
        {
            for(var prop in theObject) {
               if(theObject[prop]===""){
                delete theObject[prop];
                 //console.log('deleted',theObject.prop)
               }
                 if(theObject[prop] instanceof Object || theObject[prop] instanceof Array)
                     result = getObject(theObject[prop]);
            }
        }
    };


    $scope.cancel = function() {

        $modalInstance.dismiss('cancel');

    };
    _scope.init();
};



var zoneModalInstanceCtrl = function($scope, $modalInstance, AuthServ, $http, $location, growl) {

    $scope.createZone = function(zone_name) {
        $scope.user = AuthServ.getUser();
        if ($scope.user) {

            $http.post('/createZone', zone_name, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    console.log(data);
                    zone_name = data;
                    $modalInstance.close(zone_name);
                    growl.success('Zone has been created')
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }
    }


    $scope.cancel = function() {

        $modalInstance.dismiss('cancel');

    };
};

//change password
var changePwdModalInstanceCtrl = function($scope, $modalInstance, AuthServ, $http, $location, growl) {
    $scope.setError = false;
    $scope.changePwd = function(changedpass, valid, cnfpwd) {
        $scope.submitted = true;
        if(valid){
            if(cnfpwd == changedpass.newpassword){
                $scope.user = AuthServ.getUser();
                if ($scope.user) {

                    $http.put('/changePassword', changedpass, {
                        headers: AuthServ.getAuthHeader()
                        })
                        .success(function (data, status) {
                            $modalInstance.close(changedpass);
                            $scope.setError = false;
                            growl.success('Your password has been successfully changed');
                        })
                        .error(function (data, status) {
                            growl.error(data.message);
                        })
                }
            } else {
                $scope.setError = true;
            } 
        }
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
        $scope.setError = false;
    };
};