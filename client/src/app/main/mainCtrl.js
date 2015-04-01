'use strict';


app.controller('roleCtrl', ['$scope', 'AuthServ', '$location', '$http', function ($scope, AuthServ, $location, http) {
    $scope.init = function() {
        $scope.user = AuthServ.getUser();



        // $scope.users = $scope.user.scope;
        //    console.log($scope.users);


    };
    $scope.init();

    $scope.logOut = function() {
        AuthServ.removeUser();
        $location.path('/admin-login');
    }
}]);