app.controller('hotelDetailCtrl', ['$scope', '$http', 'AuthServ', 'growl', '$modal', '$log',
    function($scope, $http, AuthServ, growl, $modal, $log) {
    _scope = {}
    _scope.init = function() {
        hotelList();
    }


    // var hotelList = function() {
    //     $scope.user = AuthServ.getUser();
    //     $http.get('/getHotelList', {
    //             headers: AuthServ.getAuthHeader()
    //         })
    //         .success(function(data, status) {
    //             $scope.hotel_list = data;
    //         })
    //         .error(function(data, status) {
    //             growl.error(data.message);
    //         });
    // }


    // Get All hotel List Created by Zone Manager


    var hotelList = function() {
        $scope.user = AuthServ.getUser();
        $http.get('/getHotelsByZone', {
                headers: AuthServ.getAuthHeader()
            })
            .success(function(data, status) {
                $scope.hotel_list = data;
            })
            .error(function(data, status) {
                growl.error(data.message);
            });
    }

    $scope.updateHotelDetails = function(account_data) {
        delete account_data.hotelId;
        $scope.user = AuthServ.getUser();
        if ($scope.user) {
            $http.put('/updateHotel', account_data, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    growl.success("Hotel details has been updated");
                })
                .error(function(data, status) {
                    growl.error(data.message);
                })
        }
    }



    // create hotel and hotel manager account

    $scope.hotelAccount = function(size) {

        var modalInstance = $modal.open({
            templateUrl: 'newhotelAccountmodal.html',
            controller: 'hotelModalInstanceCtrl',
            size: size,
            resolve: {
                account_details: function() {
                    
                }
            }
        });

        modalInstance.result.then(function() {
            hotelList();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    // update hotel and hotel manager account

    $scope.updatehotelAccount = function(size, id) {

        var modalInstance = $modal.open({
            templateUrl: 'updatehotelAccountmodal.html',
            controller: 'hotelModalInstanceCtrl',
            size: size,
            resolve: {
                account_details: function() {
                    return id;
                }
            }
        });

        modalInstance.result.then(function() {
            // getLogAcclist();
            // getZoneAcclist();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    //validations
    $scope.checkName = function(data, field) {
        var INTEGER_REGEXP = /[^a-zA-Z ]/;
        if (angular.isUndefined(data) || data == '') {
            return "name is required.";
        } else if (INTEGER_REGEXP.test(data)) {
            return 'Enter Text only';
        }
    };


    $scope.checkPhone = function(data, field) {
        var INTEGER_REGEXP = /[^0-9]+/;
        if (angular.isUndefined(data) || data == '') {
            return "Number is required.";
        } else if (INTEGER_REGEXP.test(data)) {
            return 'Enter Numbers only';
        }
    };

    _scope.init();

}])


// Create hotel , hotel manager and hotel user

var hotelModalInstanceCtrl = function($scope, $modalInstance, AuthServ, $http, $location, growl, account_details) {
    $scope.createHotel = {};
    $scope.contacts = [];
    // contact_data = {
    //     prefix: '',
    //     email: '',
    //     firstname: '',
    //     lastname: '',
    //     title: '',
    //     phone: '',
    //     email: '',
    //     preferedLanguage:''
    // }
    var _scope = {};
    _scope.init = function (){
        if(account_details)
            $scope.hotelInfo = account_details;
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

    $scope.createHotelAccount = function() {
        $scope.submitted = true;
        $scope.user = AuthServ.getUser();
        if ($scope.user) {
            $scope.createHotel.hotelUser = [];
            for (var i = 0; i < $scope.contacts.length; i++) {

                $scope.createHotel.hotelUser.push($scope.contacts[i]);
            }
            $http.post('/createHotel', $scope.createHotel, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function(data, status) {
                    hotel_acc = data;
                    $modalInstance.close(hotel_acc);
                    growl.success('Hotel account has been successfully created')
                })
                .error(function(data, status) {
                    growl.error(data.message);
                });
        }
    }

    $scope.updateHotelAccount = function() {
        $scope.submitted = true;
        $scope.user = AuthServ.getUser();
        // if ($scope.user) {
        //     $scope.createHotel.hotelUser = [];
        //     for (var i = 0; i < $scope.contacts.length; i++) {

        //         $scope.createHotel.hotelUser.push($scope.contacts[i]);
        //     }
        //     $http.post('/createHotel', $scope.createHotel, {
        //             headers: AuthServ.getAuthHeader()
        //         })
        //         .success(function(data, status) {
        //             hotel_acc = data;
        //             $modalInstance.close(hotel_acc);
        //             growl.success('Hotel account has been successfully created')
        //         })
        //         .error(function(data, status) {
        //             growl.error(data.message);
        //         });
        // }
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    _scope.init();
    // $scope.status = {
    //    isFirstOpen: false,
    //    isFirstDisabled: false
    //  };



    // $scope.table = { fields: [] };




};