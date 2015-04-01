'use strict';


app.controller('cutomAccCtrl', ['$scope', '$http', '$location', 'AuthServ', 'growl',
    function ($scope, $http, $location, AuthServ, growl) {
        var _scope = {};
        _scope.init = function (){
            getAcclist();
        }
        var getAcclist = function () {
            $scope.user = AuthServ.getUser();
            $http.get('/getCustomer', {
                    headers: AuthServ.getAuthHeader()
            })
                .success(function (data, status) {
                    $scope.acct_list = data;

                })
                .error(function (data, status) {
                    growl.error(data.message);
                });
        }

        $scope.saveAccount = function (account_data) {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                delete account_data._id;
                delete account_data.__v;
                delete account_data.history;
                delete account_data.currentStay;
                $http.put('/updateCustomer', account_data, {
                        headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        console.log(data);
                        getAcclist();
                        growl.success('Account has been Updated');
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    });
            }
        }


        $scope.changePwd=function(changedpass){
         $scope.user = AuthServ.getUser();
        if($scope.user){
          $http.put('/changePassword',changedpass,{headers: AuthServ.getAuthHeader()})
          .success(function (data, status) {
            getAcclist();
            growl.success('Your Password has been Changed');
          })
          .error(function (data, status) {
            growl.error(data.message);
          })
        }
      }


        //profile edit

        $scope.titles = [{
            name: 'Male'
        }, {
            name: 'Female'
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