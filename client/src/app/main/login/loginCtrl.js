angular.module('adminRoutes').controller('LoginCtrl', [ '$scope', '$state', '$rootScope', '$http',
    function($scope, $state, $rootScope, $http){
    	$scope.loginForm ={
    		remember: true
  		};

		$scope.login = function () {
			 $state.go("app.adminsidebar");
			 console.log("Hello");
		};
		$scope.stopProp=function(event){
			event.stopPropagation();
		}
}]); 