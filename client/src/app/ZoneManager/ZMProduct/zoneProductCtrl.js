'use strict';


app.controller('zoneProductCtrl', ['$scope', '$http', '$location', 'AuthServ', 'growl', '$modal', '$base64',
    function($scope, $http, $location, AuthServ, growl, $modal, $base64) {


        $scope.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };




        $scope.Add = function(size) {
                var modalInstance = $modal.open({
                    templateUrl: 'myModalContent.html',
                    controller: ModalInstanceCtrl,
                    size: size,
                    resolve: {
                        product_detail: function() {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function(product_data) {
                    $scope.getProductList()
                });
            },
            function() {
                // $scope.editProfile=editProfileBeforeCancle;
                // $log.info('Modal dismissed at: ' + new Date());

            };
        $scope.Edit = function(size, index) {
                var modalInstance = $modal.open({
                    templateUrl: 'myModalContent1.html',
                    controller: ModalInstanceCtrl,
                    size: size,
                    resolve: {
                        product_detail: function() {
                            return $scope.product_details[index];
                        }
                    }
                });

                modalInstance.result.then(function(savedproduct_data) {
                    $scope.getProductList()
                });
            },
            function() {
                // $scope.editProfile=editProfileBeforeCancle;
                // $log.info('Modal dismissed at: ' + new Date());

            };




        // $scope.getProductDetails = function(id) {
        //     $scope.user = AuthServ.getUser();
        //     $http.get('/getProduct/' + id, {
        //             headers: AuthServ.getAuthHeader()
        //         })
        //         .success(function(data, status) {
        //             $scope.product_details = data;
        //             console.log('mm', $scope.product_details);
        //         })
        //         .error(function(data, status) {
        //             growl.error(data.message);
        //         });
        // }
        $scope.getProductList = function() {
            $scope.user = AuthServ.getUser();
            $http.get('/getProductList', {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    console.log(data);
                    $scope.product_details = data;
                })
                .error(function(data, status) {
                    growl.error(data.message);
                });
        }

        $scope.removeProduct = function(index, id) {
            $scope.user = AuthServ.getUser();
            $http.delete('/removeProduct/' + id, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    $scope.product_details.splice(index, 1);
                    growl.error('Your product is deleted');
                })
                .error(function(data, status) {
                    growl.error(data.message);
                });
        }

    }
]);




var ModalInstanceCtrl = function($scope, $modalInstance, AuthServ, $http, $location, growl, product_detail, $base64, $window) {
                        $scope.product_detail = product_detail;
                        var _scope = {};
                        _scope.init = function() {
                            getSupplierList();
                        }
                        $scope.images = [];
                        $scope.convertedImage = [];
                        var fileReaderOnload = function(e) {
                           // var base64 = toBase64();
                            $scope.convertedImage.push(e.target.result);
                        };
                    
                    
                    
                        //listen for the file selected event
                        $scope.$on("fileSelected", function(event, args) {
                            console.log(args.file);
                            $scope.$apply(function() {
                    
                                var fileReader = new FileReader();
                                fileReader.onload = fileReaderOnload;
                                fileReader.readAsDataURL(args.file);
                    
                    
                            });
                        })
                        $scope.categories = [];
                        $scope.add_category = function(categories_data) {
                            $scope.categories.push(categories_data);
                            $scope.categor = "";
                        }
                        $scope.remove_category = function(index) {
                            $scope.categories.splice(index, 1);
                        }
                        $scope.ok = function(product_data) {
                            $scope.user = AuthServ.getUser();
                            product_data.images = [];
                    
                            product_data.images = $scope.convertedImage;
                            //product_data.images = $base64.encode(product_data.images);
                            product_data.category = [];
                            for (var i = 0; i < $scope.categories.length; i++) {
                    
                                product_data.category.push($scope.categories[i]);
                            }
                            getObject(product_data);
                            if ($scope.user) {
                                product_data.supplierId = product_data.supplierId.toString();
                                $http.post('/createProduct', product_data, {
                                        headers: AuthServ.getAuthHeader()
                                    })
                                    .success(function(data, status) {
                                        console.log(data);
                                        product_data = data;
                                        $modalInstance.close(product_data);
                                        growl.success("Account has been created");
                                    })
                                    .error(function(data, status) {
                                        growl.error(data.message);
                                    });
                            }
                    
                        }
                    
                        function toBase64(buffer) {
                            var binary = '';
                            var bytes = new Uint8Array(buffer);
                            var len = bytes.byteLength;
                            for (var i = 0; i < len; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            return $window.btoa(binary);
                        }
                        var getSupplierList = function() {
                            $scope.user = AuthServ.getUser();
                            $http.get('/getSupplierList', {
                                    headers: AuthServ.getAuthHeader()
                                })
                                .success(function(data, status) {
                                    $scope.supplier_list = data;
                                    console.log("Supp", data);
                                })
                                .error(function(data, status) {
                                    growl.error(data.message);
                                });
                        }
                    
                    
                        // save supplier product
                    
                        $scope.edit_category = function(categories_data) {
                            $scope.product_detail.category.push(categories_data);
                            $scope.categor = "";
                        }
                        $scope.remove_editcategory = function(index) {
                            $scope.product_detail.category.splice(index, 1);
                        }
                        $scope.saveEditProduct = function(savedproduct_data, id) {
                            $scope.user = AuthServ.getUser();
                            delete savedproduct_data._id, delete savedproduct_data.zone, delete savedproduct_data.__v, delete savedproduct_data.zones;
                            getObject(savedproduct_data);
                            if ($scope.user) {
                                savedproduct_data.supplierId = savedproduct_data.supplierId.toString();
                                $http.put('/updateProduct/' + id, savedproduct_data, {
                                        headers: AuthServ.getAuthHeader()
                                    })
                                    .success(function(data, status) {
                                        console.log(data);
                                        $modalInstance.close(savedproduct_data);
                                        growl.success("Account has been created");
                                    })
                                    .error(function(data, status) {
                                        growl.error(data.message);
                                    });
                            }
                    
                        };
                    
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