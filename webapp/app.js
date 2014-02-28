(function (window) {
	var API_CONTEXT = 'https://hub.attask.com/attask/api-internal',
		reports = {},
		data = {};

	angular.module('TaskCaster', ['ui.bootstrap', 'ngRoute'])
		.config(['$locationProvider', function ($locationProvider) {
			$locationProvider.html5Mode(false);
		}])
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider
				.when('/', {templateUrl: 'webapp/partials/home.html', controller: 'HomeCtrl'})
				.when('/loading', {templateUrl: 'webapp/partials/loading.html'})
				.when('/report/:reportID', {templateUrl: 'webapp/partials/report.html', controller: 'ReportCtrl'})
				.otherwise({templateUrl: 'webapp/partials/404.html'});
		}])
		.run(function (apiService) {
			// TODO: This works as far as loading data is concerned, but the scope for the route doesn't see the change and view isn't updated
			window.location.hash = '/loading';

			apiService.get('dashboard/530f8b4e000bc00f1608a8243a508c10', 'fields=portalTabSections:internalSection:*,portalTabSections:internalSection:definition')
				.success(function (result) {
					for (var i=0; i<result.data.portalTabSections.length; i++) {
						var s = result.data.portalTabSections[i].internalSection,
							p = s.definition.prompt[0];

						reports[s.ID] = s;

						apiService.search(s.uiObjCode, 'listOptions={reportID:"' + s.ID + '"}&filters={"' + p.valuefield + '":"ISIS"}')
							.success(function (r) {
								data[s.ID] = r.data.items;
							});
					}

					window.location.hash = '/report/' + result.data.portalTabSections[0].internalSection.ID;
				});
		})
		.controller('HomeCtrl', function ($scope) {
		})
		.controller('ReportCtrl', function ($scope, $routeParams) {
			var ID = $routeParams.reportID;
			$scope.report = reports[ID];
		})
		.controller('IssuesCtrl', function ($scope, apiService) {
			apiService.search('OPTASK', 'listOptions={reportID:"530e6a6d000d3c71b57dba2baf4ee95e"}&filters={"team:name":"ISIS"}')
				.success(function (result) {
					$scope.data = result.data;
				});
		})
		.controller('IterationsCtrl', function ($scope, apiService) {
		})
		.factory('apiService', function ($http) {
			function _request(path, query) {
				var uri = API_CONTEXT + '/' + path + '?jsonp=JSON_CALLBACK&' + query;
				//console.log(uri);
				return $http.jsonp(uri);
			}

			function search(objCode, query) {
				return _request(objCode + '/search', query);
			}

			function get(path, query) {
				return _request(path, query);
			}

			return {
				get: get,
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
})(window);