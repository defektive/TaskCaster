(function () {
	var API_CONTEXT = 'https://hub.attask.com/attask/api-internal',
		CYCLE_ROUTES = ['issues', 'iterations'];

	angular.module('TaskCaster', ['ui.bootstrap', 'ngRoute'])
		.config(['$locationProvider', function ($locationProvider) {
			$locationProvider.html5Mode(false);
		}])
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider
				.when('/', {templateUrl: 'webapp/partials/home.html', controller: 'HomeCtrl'})
				.otherwise({templateUrl: 'webapp/partials/404.html'});

			// Cycling routes
			for (var i=0, l=CYCLE_ROUTES.length; i<l; i++) {
				var route = CYCLE_ROUTES[i],
					cased = route.substring(0, 1).toUpperCase() + route.substring(1);
				$routeProvider.when('/' + route, {templateUrl: 'webapp/partials/' + route + '.html', controller: cased + 'Ctrl'});
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
		})
		.controller('CarouselDemoCtrl', function ($scope) {
				$scope.myInterval = 5000;
				var slides = $scope.slides = [];
				function getPrefix() {
					return Math.floor(Math.random()) ? 
						"http://placekitten.com/" :
						"http://lorempixel.com/g/";

				}

				$scope.addSlide = function() {
					var newWidth = 600 + slides.length;



					slides.push({
						image: getPrefix() + newWidth + '/300',
						text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
						['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
					});
				};
				for (var i=0; i<81; i++) {
					$scope.addSlide();
				}
			});
})();