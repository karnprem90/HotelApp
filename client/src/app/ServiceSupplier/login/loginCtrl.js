angular.module('ServiceRoutes')
.controller('suloginCtrl', [ '$scope', '$state', '$rootScope', '$http','$localStorage', '$window','$location',
    function($scope, $state, $rootScope, $http, $localStorage, $window,$location){
    	$scope.loginForm ={
    		remember: true
  		};
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function() {
      $location.path('app')
  }
}]); 