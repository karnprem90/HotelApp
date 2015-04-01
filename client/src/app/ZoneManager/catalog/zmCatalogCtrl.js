angular.module('zoneManager')
.controller('zmCatalogCtrl', [ '$scope', '$state', '$rootScope', 
	'$http','$localStorage', '$window','$location', '$modal', '$log', 
    'AuthServ', 'growl',
    function($scope, $state, $rootScope, $http, $localStorage, 
    	$window, $location, $modal, $log, AuthServ, growl){
    
    _scope = {};
    _scope.init = function() {
        getCategoryList();
    }

    //get category list
    var getCategoryList = function () {
    	$http.get('/getAllCategory', {
          headers: AuthServ.getAuthHeader()
          })
          .success(function (data, status) {
          	$scope.categoryList = data;
            console.log('--------------',data);
          })
          .error(function (data, status) {
              growl.error(data.message);
          })
    }

    //create category
    $scope.createCategory = function(size) {
        var modalInstance = $modal.open({
            templateUrl: 'categoryModal.html',
            controller: 'categoryModalInstanceCtrl',
            size: size
        });

        modalInstance.result.then(function() {
        	getCategoryList();
        }, function() {

            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    //create sub-category
    $scope.createSubCategory = function(size) {
        var modalInstance = $modal.open({
            templateUrl: 'subCategoryModal.html',
            controller: 'subCategoryModalInstanceCtrl',
            size: size,
            resolve: {
                category_list:  function() {
                    return $scope.categoryList;
                }
            }
        });

        modalInstance.result.then(function() {
        	getCategoryList();
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    $scope.getSubCategoryList = function (id) {
        if(id >= 0){
           $http.get('/getAllSubCategorybyCategoryId/'+ id, {
              headers: AuthServ.getAuthHeader()
              })
              .success(function (data, status) {
                $scope.subCategoryList = data;
              })
              .error(function (data, status) {
                  growl.error(data.message);
              }) 
        } else {
            growl.error("Invalid category");
        }
    }


    _scope.init();
}]); 

//Category modal 
var categoryModalInstanceCtrl = function($scope, $modalInstance, AuthServ, $http, $location, growl) {

    $scope.create = function(category, valid) {
        $scope.submitted = true;
        if(valid){
		          $http.post('/createCategory', category, {
		              headers: AuthServ.getAuthHeader()
		              })
		              .success(function (data, status) {
		                  $modalInstance.close(category);
		                  growl.success('Category has been successfully created');
		              })
		              .error(function (data, status) {
		                  growl.error(data.message);
		              })
		        
        }
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};

//Sub-ategory modal 
var subCategoryModalInstanceCtrl = function($scope, $modalInstance, AuthServ, 
	$http, $location, growl, category_list) {
    $scope.category_list = category_list;

    $scope.create = function(subCategory, valid) {
        subCategory.category =  subCategory.category.toString();
        $scope.submitted = true;
        if(valid){
		          $http.post('/createSubCategory', subCategory, {
		              headers: AuthServ.getAuthHeader()
		              })
		              .success(function (data, status) {
		                  $modalInstance.close(subCategory);
		                  growl.success('Sub-category has been successfully created');
		              })
		              .error(function (data, status) {
		                  growl.error(data.message);
		              })
		        
        }
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};