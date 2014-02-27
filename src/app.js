(function () {
	var API_CONTEXT = 'https://hub.attask.com/attask/api-internal';

	angular.module('TaskCaster', ['ngRoute'])
		.config(['$locationProvider', function ($locationProvider) {
			$locationProvider.html5Mode(false);
		}])
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider
				.when('/', {templateUrl: 'src/partials/home.html', controller: 'HomeCtrl'})
				.otherwise({templateUrl: 'src/partials/404.html'});
		}])
		.controller('HomeCtrl', function ($scope, apiService) {
			apiService.search('OPTASK', 'listOptions={reportID:%20%22530e6a6d000d3c71b57dba2baf4ee95e%22}&filters={%22team:name%22:%22ISIS%22}')
				.success(function (result) {
					$scope.data = result.data;
				});
		})
		.factory('apiService', function ($http) {
			function search(objCode, query) {
				return $http.jsonp(API_CONTEXT + '/' + objCode + '/search?jsonp=JSON_CALLBACK&' + query);
			}

			return {
				search: search
			};
		});
})();