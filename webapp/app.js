(function (window) {
	var API_CONTEXT = 'https://hub.attask.com/attask/api-internal',
		DASHBOARD_ID = '530f8b4e000bc00f1608a8243a508c10',
		TEAM_ID = '4fe356dc000001934929cb1d2aa3f12b',
		reports = {},
		data = {};

	function getReportData(apiService, objCode, ID, valueField, callback) {
		apiService.search(objCode, 'listOptions={reportID:"' + ID + '"}&filters={"' + valueField + '":"' + TEAM_ID + '"}')
			.success(function (r) {
				data[ID] = r.data.items;
				callback();
			});
	}

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
			// TODO: This is a bit of a hack for a loading screen
			window.location.hash = '/loading';

			// Get the dashboard
			apiService.get('dashboard/' + DASHBOARD_ID, 'fields=portalTabSections:internalSection:*,portalTabSections:internalSection:definition')
				.success(function (result) {
					var l = result.data.portalTabSections.length,
						count = 0;

					// Called every time report data comes back from server, used to track response count and load result screen
					function callback() {
						count++;
						if (count === l) {
							window.location.hash = '/report/' + result.data.portalTabSections[0].internalSection.ID;
						}
					}

					// Get data for each report in the dashboard
					for (var i=0; i<l; i++) {
						var s = result.data.portalTabSections[i].internalSection,
							p = s.definition.prompt[0];

						reports[s.ID] = s;
						getReportData(apiService, s.uiObjCode, s.ID, p.valuefield, callback);
					}
				});
		})
		.controller('HomeCtrl', function ($scope) {
		})
		.controller('ReportCtrl', function ($scope, $routeParams) {
			var ID = $routeParams.reportID;
			$scope.report = reports[ID];
			$scope.data = data[ID];
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