var app = angular.module('epaApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: '/assets/partials/landing.html',
		controller: 'LandingCtrl'
	}).
	when('/search/:query', {
		templateUrl: '/assets/partials/results.html',
		controller: 'ResultsCtrl'
	}).
	otherwise({
		redirectTo: '/'
	});
}]);

app.controller('LandingCtrl', ['$scope', '$location', function($scope, $location) {
	$('#search').focus();

	$scope.search = function() {
		$location.path('/search/' + encodeURIComponent($scope.query));
	};
}]);

app.controller('ResultsCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
	var uvRoot = 'https://iaspub.epa.gov/enviro/efservice/getEnvirofactsUVDAILY/ZIP/';
	var waterRoot = 'https://iaspub.epa.gov/enviro/efservice/WATER_SYSTEM/ZIP_CODE/';

	$scope.query = decodeURIComponent($routeParams.query);
	$scope.uvLoading = false;
	$scope.waterLoading = false;

	$scope.requery = function() {
		$location.path('/search/' + encodeURIComponent($scope.query));
	};

	$scope.retrieveData = function() {
		$scope.getUVData();
		$scope.getWaterQualityData();
	};

	$scope.getUVData = function() {
		$scope.uvLoading = true;
		$http.jsonp(uvRoot + $scope.query + '/JSONP?callback=JSON_CALLBACK').success(function(data) {
			if (data.length == 0) {
				$scope.uvData = undefined;
			} else {
				$scope.interpretUVData(data[0]);
			}
		}).error(function() {
			$scope.uvData = undefined;
		}).finally(function() {
			$scope.uvLoading = false;
		});
	};

	$scope.interpretUVData = function(result) {
		if (result.UV_INDEX <= 2) {
			$scope.uvData = {
				icon: 'check',
				header: 'Low',
				color: 'green',
				text: 'A UV Index reading of 0 to 2 means low danger from the sun\'s UV rays for the average person.'
			};
		} else if (result.UV_INDEX > 2 && result.UV_INDEX <= 5) {
			$scope.uvData = {
				icon: 'info',
				header: 'Moderate',
				color: 'yellow',
				text: 'A UV Index reading of 3 to 5 means moderate risk of harm from unprotected sun exposure.'
			};
		} else if (result.UV_INDEX > 5 && result.UV_INDEX <= 7) {
			$scope.uvData = {
				icon: 'warning',
				header: 'High',
				color: 'orange',
				text: 'A UV Index reading of 6 to 7 means high risk of harm from unprotected sun exposure. Protection against skin and eye damage is needed.'
			};
		} else if (result.UV_INDEX > 7 && result.UV_INDEX <= 10) {
			$scope.uvData = {
				icon: 'warning sign',
				header: 'Very High',
				color: 'red',
				text: 'A UV Index reading of 8 to 10 means very high risk of harm from unprotected sun exposure. Take extra precautions because unprotected skin and eyes will be damaged and can burn quickly.'
			};
		} else {
			$scope.uvData = {
				icon: 'remove',
				header: 'Extreme',
				color: 'blue',
				text: 'A UV Index reading of 11 or more means extreme risk of harm from unprotected sun exposure. Take all precautions because unprotected skin and eyes can burn in minutes.'
			};
		}
		$scope.uvData.rating = result.UV_INDEX;
	};

	$scope.getWaterQualityData = function() {
		$scope.waterLoading = true;
		$http.jsonp(waterRoot + $scope.query + '/JSONP?callback=JSON_CALLBACK').success(function(facilities) {
			$scope.facilities = facilities;
		}).error(function() {
			$scope.facilities = [];
		}).finally(function() {
			$scope.waterLoading = false;
		});
	};

	$scope.retrieveData();
}]);