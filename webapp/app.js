(function (window) {
	var API_CONTEXT = 'https://hub.attask.com/attask/api-internal',
		reports = {},
		data = {};

	angular.module('TaskCaster', ['ngRoute'])
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

		.directive('clock', function($interval, dateFilter) {

			function link(scope, element, attrs) {
				var format,
				timeoutId;
				
				scope.time = new Date();



				function updateTime() {
					scope.time = new Date;
					scope.$digest();
					console.log("update");
					setTimeout(updateTime, 1000);
				}

				window.addEventListener("load", function (){
					setTimeout (function (){
					console.log("asd")

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
	
  
	// utility function to display the text message in the input field
	function displayText(text) {
		console.log(text);
		document.getElementById("message").innerHTML=text;
		window.castReceiverManager.setApplicationState(text);
	};
})(window);
