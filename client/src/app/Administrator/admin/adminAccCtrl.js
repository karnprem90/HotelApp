'use strict';

/* Controllers */


app.controller('adminAccountCtrl', ['$scope', '$rootScope', '$http', '$location', 'AuthServ', 'growl', '$q', '$modal', '$log',
    function($scope, $rootScope, $http, $location, AuthServ, growl, $q, $modal, $log) {

        $scope.titles = [{
            name: 'Mr'
        }, {
            name: 'Ms'
        }];

        var _scope = {};
        _scope.init = function() {
            getAcclist();
            getAdminacclist();
            getCountrysList();
            getLanguagesList();
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

        //get Admin account list
        var getAdminacclist = function() {
            $scope.user = AuthServ.getUser();
            $http.get('/getAdmin', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    
                    if($rootScope.admin_acct == undefined){
                       $rootScope.admin_acct = data; 
                    } 
                    console.log( 'account array' , $rootScope.admin_acct);
                })
                .error(function(data, status) {
                    growl.error(data.message);
                })
        }
        //get ExecutiveManager All List Created By Admin

        
        var getAcclist = function() {
            $scope.user = AuthServ.getUser();
            $http.get('/getExecutiveManagerList', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    console.log(data);
                    $scope.acct_list = data;
                })
                .error(function(data, status) {
                    growl.error(data.message);
                })
        }

        $scope.saveAccount = function (account_data) {
            $scope.user = AuthServ.getUser();
            if ($scope.user) {
                $http.put('/updateAdmin', {"persons": account_data}, {headers: AuthServ.getAuthHeader()})
                    .success(function (data, status) {
                        console.log(data);
                        getAcclist();
                        growl.success("Account has been updated");
                     })
                    .error(function(data, status) {
                        growl.error(data.message);
                    })
            }
        }


        //upload tablet file

    $scope.startRead = function(file, option) {
      
      if (file) {
        var name = file.name.split(".");
        if(name[name.length - 1] == "csv" ){
          $scope.uploadedFileType = 'csv';
          getData(file);
        }
      }
    }

    //reading csv file
    var getData = function (readFile) {
      var reader = new FileReader();
      reader.readAsText(readFile);
      reader.onload = processData;
    }

    var processData = function (allText) {
          var result=allText.srcElement.result;
          var allTextLines = result
          csvJSON(allTextLines);
    }

    //var csv is the CSV file with headers
    function csvJSON(csv){
     
      var lines=csv.split("\n");
     
      $scope.result = [];
     
      var headers=lines[0].split(",");
     
      for(var i=0; i<lines.length;i++){
     
          var obj = {};
          var currentline=lines[i].split(",");
     
          for(var j=0;j<headers.length;j++){
              obj[headers[j]] = currentline[j];
          }
     
          $scope.result.push(obj);
     
      }
    }


    $scope.createTablet = function() {
        var result = JSON.stringify($scope.result);
        $scope.user = AuthServ.getUser();
            $http.post('/createTablet', result , {
                headers: AuthServ.getAuthHeader()
            })
            .success(function(data, status) {
                console.log(data);
                growl.success('Account has been created');
            })
            .error(function(data, status) {
                growl.error(data.message);
            })
    }

        //change password

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

        


        $scope.newAccount = function(size) {

            var modalInstance = $modal.open({
                templateUrl: 'newAccountmodal.html',
                controller: 'adminaccountModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function() {
                    getAcclist();
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        $scope.addEmailAccount = function(size) {
            getAdminacclist();
            var modalInstance = $modal.open({
                templateUrl: 'addEmailModal.html',
                controller: 'emailModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function() {
                getAdminacclist();

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        $scope.addphoneAccount = function(size) {
            getAdminacclist();
            var modalInstance = $modal.open({
                templateUrl: 'addphoneModal.html',
                controller: 'phoneModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function() {
                getAdminacclist();

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        $scope.removeEmail = function (list) {
            for(var i=0; i < $rootScope.admin_acct.alertEmail.length ; i++){
                for (var j=0; j < list.length; j++) {
                    if($rootScope.admin_acct.alertEmail[i] == list[j]){
                        $rootScope.admin_acct.alertEmail.splice(i, 1);
                    }
                }; 
            }
        }

        $scope.removePhone = function (list) {
            for(var i=0; i < $rootScope.admin_acct.alertPhone.length ; i++){
                for (var j=0; j < list.length; j++) {
                    if($rootScope.admin_acct.alertPhone[i] == list[j]){
                        $rootScope.admin_acct.alertPhone.splice(i, 1);
                    }
                }; 
            }
        }

        $scope.updateAdminInfo = function (account_details) {
            $scope.user = AuthServ.getUser();
            delete account_details._id, delete account_details.__v;
                if ($scope.user) {
                    $http.put('/updateAdmin', account_details, {
                            headers: AuthServ.getAuthHeader()
                        })
                        .success(function(data, status) {
                            $rootScope.account_data = data;
                            growl.success('Account has been updated');
                        })
                        .error(function(data, status) {
                            growl.error(data.message);
                        })
                }
        }


        _scope.init();

    }
]);

// Create Executive Manager By Admin

var adminaccountModalInstanceCtrl = function($scope, $modalInstance, AuthServ, $http, $location, growl) {

    var _scope = {};
    _scope.init = function() {
        getCountrysList();
        getLanguagesList();
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

    $scope.createExecMgrAccount = function(account_data, valid) {
        $scope.submitted = false;
        if(valid){
            console.log(account_data);
            $scope.user = AuthServ.getUser();
            getObject(account_data);
            if ($scope.user) {
                $http.post('/createExecutiveManager', account_data, {
                        headers: AuthServ.getAuthHeader()
                    })
                    .success(function(data, status) {
                        $scope.submitted = false;
                        account_data = data;
                        $modalInstance.close(account_data);
                        growl.success('Account has been created');
                    })
                    .error(function(data, status) {
                        growl.error(data.message);
                    })
            }  
        } else {
            $scope.submitted = true;
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

//add email to alerts email list
var emailModalInstanceCtrl = function($scope, $rootScope, $modalInstance, AuthServ, $http, $location, growl) {

    $scope.updateEmailList = function(email, valid) {
        $scope.submitted = true;
        $scope.user = AuthServ.getUser();
        if(valid) {
            $rootScope.admin_acct.alertEmail.push(email);
            $modalInstance.close(email);
        }        
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};

//add phone to alerts phone numbers list
var phoneModalInstanceCtrl = function($scope, $rootScope, $modalInstance, AuthServ, $http, $location, growl) {

    $scope.updatePhoneList = function(phone, valid) {
        $scope.submitted = true;
        $scope.user = AuthServ.getUser();
        console.log('admin_acct',$rootScope.admin_acct);
        if(valid) {
           $rootScope.admin_acct.alertPhone.push(phone);
           $modalInstance.close(phone); 
        }          
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};