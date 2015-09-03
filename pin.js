"use strict";

angular.module("Pin", ["ui.bootstrap", "google-maps", "ngRoute"]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {templateUrl: 'partials/splash.html'});
	$routeProvider.when('/pin', {templateUrl: 'partials/map.html', controller: 'DropPin'});
	$routeProvider.when('/pin/:id', {templateUrl: 'partials/map.html', controller: 'GetPin'});
	
	$routeProvider.otherwise({redirectTo: '/'});
}])
.controller('DropPin', ['$scope', '$http', '$modal', function($scope, $http, $modal) {
	var coords = null;
	
	$scope.map = {
		center: {
			lat: 32.77,
			lng: -79.93
		},
		markers: [],
		zoom: 16,
		clickedLatitude: null,
		clickedLongitude: null
	};
	
	$scope.droppedPin = false;
	
	$scope.wrongLocation = function() {
		var modalInstance = $modal.open({
			templateUrl: 'partials/message.html',
			controller: 'Message',
			resolve: {
				message: function() {
					return {
						title: "Chill Out Bro",
						message: "This thing is still in alpha, additional features to come soon."
					};
				}
			}
		});
	}
	
	$scope.dropPin = function() {
		var setExpiration = $modal.open({
			templateUrl: 'partials/setExpiration.html',
			controller: 'SetExpiration'
		});
		
		setExpiration.result.then(function(expiration) {
			expiration = expiration * 60;
			$http.post("api/pin", {
				location: coords.latitude + ";" + coords.longitude,
				ttl: expiration 
			}).success(function(data) {
				var copyCode = $modal.open({
					templateUrl: 'partials/copy.html',
					controller: 'CopyCode',
					resolve: {
						code: function() {
							return "http://pin.dayoftheduck.com/#/pin/" + data.key;
						}
					}
				});
			});	
		});
	}

	navigator.geolocation.getCurrentPosition(function(location) {
		coords = location.coords;
		$scope.$apply(function() {
			$scope.map.center = {
				lat: coords.latitude,
				lng: coords.longitude
			};
			$scope.map.markers = [{
				latitude: coords.latitude,
				longitude: coords.longitude
			}];
		});
	});	
}])
.controller('SetExpiration', ["$scope", "$modalInstance", function($scope, $modalInstance) {
	$scope.expiration = "";
	
	$scope.close = function() {
		//redirect to home
		$modalInstance.close();
	}
	$scope.drop = function() {
		$scope.expiration = document.getElementById('expiration').value;
		$modalInstance.close(parseInt($scope.expiration));
	}
}])
.controller('CopyCode', ["$scope", "$modalInstance", "code", function($scope, $modalInstance, code) {
	$scope.code = code;
	
	$scope.close = function() {
		//redirect to home
		$modalInstance.close();
	}
}])
.controller('GetPin', ['$scope', '$http', '$routeParams', '$modal', function($scope, $http, $params, $modal) {
	$scope.map = {
		center: {
			lat: 45,
			lng: -73
		},
		markers: [],
		zoom: 16,
		clickedLatitude: null,
		clickedLongitude: null
	};

	$http.get("api/pin/" + $params.id).success(function(data) {
		if (data.location) {
			var location = data.location.split(";");
			$scope.map.center = {
				lat: location[0],
				lng: location[1]
			};
			$scope.map.markers = [{
				latitude: location[0],
				longitude: location[1]
			}];		
		} else {
			var modalInstance = $modal.open({
				templateUrl: 'partials/message.html',
				controller: 'Message',
				resolve: {
					message: function() {
						return data.message;
					}
				}
			}); 
		}
	});
}])
.controller('Message', ["$scope", "$modalInstance", "message", function($scope, $modalInstance, message) {
	$scope.message = message.message;
	$scope.title = message.title;
	
	$scope.close = function() {
		$modalInstance.close();
	}
}]);