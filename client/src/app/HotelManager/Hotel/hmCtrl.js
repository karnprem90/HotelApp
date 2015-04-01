'use strict';


app.controller('hmCtrl', ['$scope', '$location', '$rootScope', '$http', 'growl', 'AuthServ', '$modal',
    function($scope, $location, $rootScope, $http, growl, AuthServ, $modal) {
        var _scope = {};
        _scope.init = function() {
            getAcclist();
            getLanguagesList();
        }
        var getAcclist = function() {
            $scope.user = AuthServ.getUser();
            $http.get('/getHotelManager', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    $scope.acct_list = data;
                })
                .error(function(data, status) {
                    growl.error(data.message);
                });
        }

        var getLanguagesList = function() {
            $scope.user = AuthServ.getUser();
            $http.get('/getLanguageList', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    $scope.languagesList = data;
                })
                .error(function(data, status) {
                    growl.error(data.message);
                });
        }

        $scope.updateHotelMgrAccount = function(account_data) {
            $scope.user = AuthServ.getUser();
            delete account_data.__v, delete account_data._id;
            delete account_data.zone, delete account_data.preferedLanguage, delete account_data.hotel;
            if ($scope.user) {
                $http.put('/updateHotelManager', account_data, {
                        headers: AuthServ.getAuthHeader()
                    })
                    .success(function(data, status) {
                        console.log(data);
                        getAcclist();
                        growl.success("Account has been updated");
                    })
                    .error(function(data, status) {
                        growl.error(data.message);
                    });
            }
        }

        //hotel checkin -check out details

        // $scope.checkindetails = function(checkindata) {
        //     $scope.user = AuthServ.getUser();
        //     if ($scope.user) {
        //         $http.post('/checkinCustomer', checkindata, {
        //                 headers: AuthServ.getAuthHeader()
        //             })
        //             .success(function(data, status) {
        //                 $scope.checkindetails = data;


        //             })
        //             .error(function(data, status) {
        //                 growl.error(data.message);
        //             });
        //     }
        // }

        // $scope.checkoutdetails = function(checkoutdata) {
        //     $scope.user = AuthServ.getUser();
        //     if ($scope.user) {
        //         $http.post('/checkoutCustomer', checkoutdata, {
        //                 headers: AuthServ.getAuthHeader()
        //             })
        //             .success(function(data, status) {
        //                 growl.success("You have been checked out.Thanks");
        //             })
        //             .error(function(data, status) {
        //                 growl.error(data.message);
        //             });
        //     }
        // }



        $scope.changePwd = function(changedpass) {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.put('/changePassword', changedpass, {
                        headers: AuthServ.getAuthHeader()
                    })
                    .success(function(data, status) {
                        getAcclist();
                        growl.success('Your Password has been Changed');
                    })
                    .error(function(data, status) {
                        growl.error(data.message);
                    })
            }
        }


        $scope.createCustomerAccount = function(account_data) {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.post('/createCustomer', account_data, {
                        headers: AuthServ.getAuthHeader()
                    })
                    .success(function(data, status) {
                        console.log(data);
                        $location.path('app');
                        growl.success("Account has been created");
                    })
                    .error(function(data, status) {
                        growl.error(data.message);
                    });
            }
        }


        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };


        $scope.changeAccountPassword = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'hotelManagerPwdModal.html',
                controller: 'hotelManagerPwdModalCtrl',
                size: size
            });

            modalInstance.result.then(function() {

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        // $scope.createhotelUsrAccount = function(account_data) {
        //     $scope.user = AuthServ.getUser();
        //     if ($scope.user) {
        //         $http.post('/createHotelUser', account_data, {
        //                 headers: AuthServ.getAuthHeader()
        //             })
        //             .success(function(data, status) {
        //                 console.log(data);
        //                 $location.path('app');
        //                 growl.success("Account has been created");
        //             })
        //             .error(function(data, status) {
        //                 growl.error(data.message);
        //             });
        //     }
        // }

        _scope.init();

    }
]);

// change hotel manager password controller

var hotelManagerPwdModalCtrl = function($scope, $modalInstance, AuthServ, $http, $location, growl) {
    $scope.setError = false;
    $scope.changePwd = function(changedpass, valid, cnfpwd) {
        $scope.submitted = true;
        if (valid) {
            if (cnfpwd == changedpass.newpassword) {
                $scope.user = AuthServ.getUser();
                if ($scope.user) {

                    $http.put('/changePassword', changedpass, {
                            headers: AuthServ.getAuthHeader()
                        })
                        .success(function(data, status) {
                            $modalInstance.close(changedpass);
                            $scope.setError = false;
                            growl.success('Your password has been successfully changed');
                        })
                        .error(function(data, status) {
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