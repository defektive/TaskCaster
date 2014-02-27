(function () {
	var API_CONTEXT = 'https://hub.attask.com/attask/api-internal',
		CYCLE_ROUTES = ['issues', 'iterations'];

	angular.module('TaskCaster', ['ngRoute'])
		.config(['$locationProvider', function ($locationProvider) {
			$locationProvider.html5Mode(false);
		}])
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider
				.when('/', {templateUrl: 'src/partials/home.html', controller: 'HomeCtrl'})
				.otherwise({templateUrl: 'src/partials/404.html'});

			// Cycling routes
			for (var i=0, l=CYCLE_ROUTES.length; i<l; i++) {
				var route = CYCLE_ROUTES[i],
					cased = route.substring(0, 1).toUpperCase() + route.substring(1);
				$routeProvider.when('/' + route, {templateUrl: 'src/partials/' + route + '.html', controller: cased + 'Ctrl'});
			}

			var currentIndex = -1;

			setInterval(function () {
				currentIndex++;
				if (currentIndex >= CYCLE_ROUTES.length) {
					currentIndex = 0;
				}
				window.location.hash = '/' + CYCLE_ROUTES[currentIndex];
			}, 5000);
		}])
		.controller('HomeCtrl', function ($scope, $location, apiService) {
		})
		.controller('IssuesCtrl', function ($scope, apiService) {
			apiService.search('OPTASK', 'listOptions={reportID:%20%22530e6a6d000d3c71b57dba2baf4ee95e%22}&filters={%22team:name%22:%22ISIS%22}')
				.success(function (result) {
					$scope.data = result.data;
				});
		})
		.controller('IterationsCtrl', function ($scope, apiService) {
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