(function (window) {
	var API_CONTEXT = 'https://hub.attask.com/attask/api-internal',
		DASHBOARD_ID = '530f8b4e000bc00f1608a8243a508c10',
		TEAM_ID = '4fe356dc000001934929cb1d2aa3f12b',
		REPORT_DELAY = 8, // How long the report is displayed in seconds
		reportIDs = [],
		reports = {},
		data = {},
		apiKey;

	angular.module('TaskCaster', ['ngRoute'])
		.config(['$locationProvider', function ($locationProvider) {
			$locationProvider.html5Mode(false);
		}])
		.config(['$routeProvider', function ($routeProvider) {
			$routeProvider
				.when('/', {templateUrl: 'webapp/partials/home.html', controller: 'HomeCtrl'})
				.when('/loading', {templateUrl: 'webapp/partials/loading.html'})
				.when('/error/:message', {templateUrl: 'webapp/partials/error.html', controller: 'ErrorCtrl'})
				.when('/report/:reportID', {templateUrl: 'webapp/partials/report.html', controller: 'ReportCtrl'})
				.otherwise({templateUrl: 'webapp/partials/404.html'});
		}])
		.run(function (apiService, dashboardService, navService) {
			navService.redirect('/loading');

			setTimeout(function (){
				var count = 0;
				console.log("Run report: " + apiKey)
				dashboardService.load(function (len) {
					count++;
					if (count === len) {
						navService.redirect('/report/' + reportIDs[0]);
					}
				})
			}, 4000);
		})
		.controller('HomeCtrl', function ($scope) {
		})
		.controller('ErrorCtrl', function ($scope, $routeParams) {
			$scope.message = $routeParams.message;
		})
		.controller('ReportCtrl', function ($scope, $routeParams, navService) {
			var ID = $routeParams.reportID;
			$scope.report = reports[ID];
			$scope.data = data[ID];
			$scope.columns = [];

			for (var i=0, c=$scope.report.view.definition.column, l=c.length; i<l; i++) {
				if (c[i].shortview === 'true') {
					$scope.columns.push(c[i]);
				}
			}

			// Update the report being displayed on a timer
			setTimeout(function () {
				var index = reportIDs.indexOf(ID);
				index = (index + 1 >= reportIDs.length) ? 0 : index + 1;
				navService.redirect('/report/' + reportIDs[index]);
			}, 1000 * REPORT_DELAY);
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
				var uri = API_CONTEXT + '/' + path + '?apiKey='+apiKey +'&jsonp=JSON_CALLBACK&' + query;
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
		.factory('dashboardService', function (apiService, navService) {
			function getReportData(objCode, ID, valueField, callback) {
				apiService.search(objCode, 'listOptions={reportID:"' + ID + '"}&filters={"' + valueField + '":"' + TEAM_ID + '"}')
					.success(function (result) {
						if (result.error) {
							navService.redirect('/error/' + result.error.message);
						}

						data[ID] = result.data.items;
						callback();
					});
			}

			function getDashboardData(callback) {
				apiService.get('dashboard/' + DASHBOARD_ID, 'fields=portalTabSections:internalSection:*,portalTabSections:internalSection:definition,portalTabSections:internalSection:view:definition')
					.success(function (result) {
						if (result.error) {
							navService.redirect('/error/' + result.error.message);
						}

						var l = result.data.portalTabSections.length;

						// Get data for each report in the dashboard
						for (var i=0; i<l; i++) {
							var s = result.data.portalTabSections[i].internalSection,
								p = s.definition.prompt[0];

							reports[s.ID] = s;
							reportIDs.push(s.ID);
							getReportData(s.uiObjCode, s.ID, p.valuefield, function () {
								if (typeof callback === 'function') {
									callback.call(null, l);
								}
							});
						}
					});
			}

			return {
				load: function (callback) {
					getDashboardData.call(null, callback);
				}
			};
		})
		.factory('navService', function () {
			return {
				redirect: function (location) {
					window.location.hash = location;
				}
			};
		})

		.filter('columnName', function () {
			return function (col) {
				var idx = col.indexOf(':');
				if (idx > -1) {
					col = col.substring(0, idx);
				}

				var str = '',
					i = col.length;

				while (i--) {
					str += i > 0 ? col.charAt(i) : col.charAt(i).toUpperCase();
					if (col.charCodeAt(i) >= 65 &&
						col.charCodeAt(i) <= 90) {
						str += ' ';
					}
				}

				str = str.split('').reverse().join('');

				return str;
			};
		})
		.filter('columnValue', function () {
			return function (val, col) {
				return val;
			};
		})

		.directive('clock', function($interval, dateFilter) {

			function link(scope, element, attrs) {
				var format,
				timeoutId;
				
				scope.time = new Date();



				function updateTime() {
					scope.time = new Date;
					scope.$digest();
					setTimeout(updateTime, 1000);
				}

				window.addEventListener("load", function (){
					setTimeout (function (){
						updateTime();
					}, 10000);
				});
			}

			return {
				restrict: "E",
				link: link,
				template: "{{ time | date:'h:mm' }}"
			};
		});


	var namespace = 'urn:x-cast:com.attask.cast.dashboard';
	if (window.location.host == "googledrive.com") {
		var script = document.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.setAttribute("src", "//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js");
		document.head.appendChild(script);

		window.onload = function() {
			setTimeout(function (){

				try {
					cast.receiver.logger.setLevelValue(0);
					window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
					console.log('Starting Receiver Manager');

					// handler for the 'ready' event
					castReceiverManager.onReady = function(event) {
						console.log('Received Ready event: ' + JSON.stringify(event.data));
						window.castReceiverManager.setApplicationState("Application status is ready...");
					};

					// handler for 'senderconnected' event
					castReceiverManager.onSenderConnected = function(event) {
						console.log('Received Sender Connected event: ' + event.data);
						console.log(window.castReceiverManager.getSender(event.data).userAgent);
					};

					// handler for 'senderdisconnected' event
					castReceiverManager.onSenderDisconnected = function(event) {
						console.log('Received Sender Disconnected event: ' + event.data);
						if (window.castReceiverManager.getSenders().length == 0) {
							window.close();
						}
					};

					// handler for 'systemvolumechanged' event
					castReceiverManager.onSystemVolumeChanged = function(event) {
						console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
						event.data['muted']);
					};

					// create a CastMessageBus to handle messages for a custom namespace
					window.messageBus = window.castReceiverManager.getCastMessageBus(namespace);

					// handler for the CastMessageBus message event
					window.messageBus.onMessage = function(event) {
						console.log('Message [' + event.senderId + ']: ' + event.data);
						// display the message from the sender
						displayText(event.data);

						var data = JSON.parse(event.data);
						processMessage(data);

						// inform all senders on the CastMessageBus of the incoming message event
						// sender message listener will be invoked
						window.messageBus.send(event.senderId, event.data);
					}

					// initialize the CastReceiverManager with an application status message
					window.castReceiverManager.start({statusText: "Application is starting"});
					console.log('Receiver Manager started');


				} catch (e) {
					console.log(e);
				}
			}, 0);
		};
	}
	
	function processMessage(data){
		if(data.accessKey) {
			console.log("set api key")
			apiKey = data.accessKey;
		}
	}
  
	// utility function to display the text message in the input field
	function displayText(text) {
		console.log(text);
		document.getElementById("message").innerHTML=text;
		window.castReceiverManager.setApplicationState(text);
	};
})(window);
