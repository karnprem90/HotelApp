'use strict';


app.controller('supplierUserCtrl', ['$scope', '$http', '$location', 'AuthServ', 'growl', '$q',
    function ($scope, $http, $location, AuthServ, growl, $q) {


        var _scope = {};
        _scope.init = function (){
            getAcclist();
        }    
        var getAcclist = function () {
            $scope.user = AuthServ.getUser();
            $http.get('/getSupplierManager', {headers: AuthServ.getAuthHeader()})
                .success(function (data, status) {
                    console.log(data);
                    $scope.acct_list = data;
                })
        }

        $scope.isSaving = undefined;
        $scope.saveButton = false;

        $scope.saveAccount = function (account_data) {
            delete account_data.dayOff,delete account_data._id;
            delete account_data.__v,delete account_data.email,delete account_data.supplier;
            $scope.user = AuthServ.getUser();
            if ($scope.user) {

                $http.put('/updateSupplierManager', account_data, { headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        console.log(data);
                        getAcclist();
                        growl.success("Account has been updated");
                        $scope.isSaving = undefined;
                        $scope.saveButton = false;
                        $scope.editButton = false;
                    })
                    .error(function (data, status) {
                        growl.error(data.message);
                    })
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



        // var productDetails = function () {
        //     $scope.user = AuthServ.getUser();
        //     if ($scope.user) {
        //         $http.get('/getProductBySupplierId', {headers: AuthServ.getAuthHeader()})
        //             .success(function (data, status) {
        //                 console.log("data");
        //                 $scope.productData=data;
        //             });
        //     }
        // }





      
        $scope.updateAccount = function() {
            $scope.isSaving = true;
            $scope.saveButton = true;
            $scope.editButton = true;

        };

        _scope.init();

    }
]);