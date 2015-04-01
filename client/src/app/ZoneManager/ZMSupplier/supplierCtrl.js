'use strict';


app.controller('supplierCtrl', ['$scope', '$http', '$location', 'AuthServ', 'growl', '$modal', '$base64',
    function($scope, $http, $location, AuthServ, growl, $modal, $base64) {

        var _scope = {};
        _scope.init = function(){
            getAllSupplier();
        }
        $scope.newSupplier = function(size) {
                var modalInstance = $modal.open({
                    templateUrl: 'suppModalContent.html',
                    controller: supplierModalInstanceCtrl,
                    size: size,
                    resolve: {
                        product_detail: function() {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function(product_data) {
                    getAllSupplier();
                });
            },
            function() {
                // $scope.editProfile=editProfileBeforeCancle;
                // $log.info('Modal dismissed at: ' + new Date());

            };
        // $scope.Edit = function(size, index) {
        //         var modalInstance = $modal.open({
        //             templateUrl: 'myModalContent1.html',
        //             controller: ModalInstanceCtrl,
        //             size: size,
        //             resolve: {
        //                 product_detail: function() {
        //                     return $scope.product_details[index];
        //                 }
        //             }
        //         });

        //         modalInstance.result.then(function(savedproduct_data) {
        //             $scope.getProductList()
        //         });
        //     },
        //     function() {
        //         // $scope.editProfile=editProfileBeforeCancle;
        //         // $log.info('Modal dismissed at: ' + new Date());

        //     };




        var getAllSupplier = function() {
            $scope.user = AuthServ.getUser();
            $http.get('/getAllSupplier', { headers: AuthServ.getAuthHeader() })
                .success(function(data, status) {
                    $scope.supplier_details = data;
                    console.log(data);
                   
                })
                .error(function(data, status) {
                    growl.error(data.message);
                });
        }
 
        _scope.init();
    }]);




var supplierModalInstanceCtrl = function($scope, $modalInstance, AuthServ, $http, $location, growl) {
        $scope.createSupplier={};
        $scope.time = 'NotSet';
        $scope.openingtime='NotSet';
        var _scope = {};
        _scope.init = function() {
            $scope.submit = false;
            getCountrysList();
            getLanguagesList();
        }


    $scope.contacts = [];
    // var contact_data = {
    //     prefix: '',
    //     email: '',
    //     firstname: '',
    //     lastname: '',
    //     title: '',
    //     phone: '',
    //     preferedLanguage:''
    // }
    $scope.newContact = function() {
        $scope.contacts.push({
        prefix: '',
        email: '',
        firstname: '',
        lastname: '',
        title: '',
        phone: '',
        preferedLanguage:''
        });
        console.log($scope.contacts);
    }
    $scope.dateopening = [];
    $scope.addOpening = function(){
        $scope.dateopening.push( {
        date: new Date().toString("MM/dd/yyyy"),
        time: null
    })
        console.log($scope.dateopening);
    }
    $scope.workingtime = [{}];
    $scope.addWorkingDay = function(){
        $scope.workingtime.push( {
        day: '',
        openingTime:'',
        closingTime:''
    })
        console.log($scope.workingtime);
    }

    $scope.selectedDates = [];
    $scope.createSuppAccount = function() {
        $scope.submitted = true;
        $scope.user = AuthServ.getUser();
        if ($scope.user) {

            if($scope.selectedDates.length > 0)
          {  
            var dayoff = $scope.selectedDates.toString("MM/dd/yyyy");
            $scope.createSupplier.dayOff=[];
              for(var i=0; i<dayoff.length; i++)
              {
                $scope.createSupplier.dayOff.push(dayoff[i]); 
              }
          }    
            //add exceptional opening

            $scope.createSupplier.supplier.exceptionalOpening = [];
            for (var i = 0; i < $scope.dateopening.length; i++) {

                $scope.createSupplier.supplier.exceptionalOpening.push($scope.dateopening[i]);
            }
            //add working time opening

            $scope.createSupplier.supplier.workingTime = [];
            for (var i = 0; i < $scope.workingtime.length; i++) {

                $scope.createSupplier.supplier.workingTime.push($scope.workingtime[i]);
            }
            //add multiple contacts

            $scope.createSupplier.supplierUser = [];
            for (var i = 0; i < $scope.contacts.length; i++) {

                $scope.createSupplier.supplierUser.push($scope.contacts[i]);
            }
            getObject($scope.createSupplier);
            $http.post('/createSupplier', $scope.createSupplier, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    console.log(data);
                     $scope.createSupplier = data;
                    $modalInstance.close( $scope.createSupplier);
                    growl.success('Supplier Account has been created')
                })
                .error(function(data, status) {
                    growl.error(data.message);
                });
        }
    }

        $scope.datePicker = {opened:false};
        $scope.openDate = function($event) {
             $event.preventDefault();
             $event.stopPropagation();
             $scope.datePicker.opened = true;
        };
        $scope.datePicker2 = {opened2:false};
        $scope.openDate2 = function($event,index) {
             $scope.newOpeningDate = []
             $event.preventDefault();
             $event.stopPropagation();
             $scope.datePicker2.opened2 = true;
             $scope.newOpeningDate[index] = true;

        };

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