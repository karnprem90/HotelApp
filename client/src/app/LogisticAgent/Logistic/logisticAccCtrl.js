'use strict';

app.controller('logisticAccCtrl', ['$scope', '$http', '$location', 'AuthServ', 'growl', '$modal',
    function ($scope, $http, $location, AuthServ, growl, $modal) {

        var _scope = {};
        _scope.init = function (){
            getAcclist();
            getCountrysList();
            getLanguagesList();
            $scope.submit = false;
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

        var getAcclist = function () {
            $scope.user = AuthServ.getUser();
            $http.get('/getLogisticAgent', {headers: AuthServ.getAuthHeader()})
                .success(function (data, status) {
                    $scope.acct_info = data;
                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }

        $scope.updateAccount = function (account_data, valid) {
            $scope.submit = false;
            if(valid){
                $scope.user = AuthServ.getUser();
                if ($scope.user) {
                    delete account_data._id, 
                    delete account_data.__v, delete account_data.zones;
                    $http.put('/updateLogisticAgent', account_data, {headers: AuthServ.getAuthHeader()})
                        .success(function (data, status) {
                            getAcclist();
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
      //   $scope.changePwd=function(changedpass){
      //    $scope.user = AuthServ.getUser();
      //   if($scope.user){
      //     $http.put('/changePassword',changedpass,{headers: AuthServ.getAuthHeader()})
      //     .success(function (data, status) {
      //       getAcclist();
      //       growl.success('Your Password has been Changed');
      //     })
      //     .error(function (data, status) {
      //       growl.error(data.message);
      //     })
      //   }
      // }
      

        //profile edit

        $scope.titles = [{
            name: 'Mr'
        }, {
            name: 'Ms'
        }];

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