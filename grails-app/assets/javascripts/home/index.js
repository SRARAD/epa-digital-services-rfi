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

app.controller('ResultsCtrl', ['$scope', '$http', '$filter', '$location', '$routeParams', '$q', function($scope, $http, $filter, $location, $routeParams, $q) {
	var uvRoot = 'https://iaspub.epa.gov/enviro/efservice/getEnvirofactsUVDAILY/';
	var waterRoot = 'https://iaspub.epa.gov/enviro/efservice/WATER_SYSTEM/';
	var violationRoot = 'https://iaspub.epa.gov/enviro/efservice/VIOLATION/PWSID/';

	var addressComponentLookup = [
		'postal_code',
		'locality',
		'administrative_area_level_1'
	];

	$scope.waterViolationCodes = [{
		label: 'Maximum Contaminant Level',
		code: 'MCL'
	}, {
		label: 'Maximum Residual Disinfectant Level',
		code: 'MRDL'
	}, {
		label: 'Treatment Technique',
		code: 'TT'
	}, {
		label: 'Monitoring and Reporting',
		code: 'MR'
	}];

	$scope.query = decodeURIComponent($routeParams.query);
	$scope.uvLoading = false;
	$scope.waterLoading = false;
	$scope.currentViolations = [];

	$scope.geocoder = new google.maps.Geocoder();
	$scope.stateCodes = states;

	$scope.getQueryZipcode = function() {
		var d = $q.defer();
		var location = {};
		$scope.geocoder.geocode({'address': $scope.query}, function(results, status) {
			if (results.length != 0) {
				$scope.location = results[0].formatted_address;
				results[0].address_components.forEach(function(addressComponent) {
					addressComponentLookup.forEach(function(lookup) {
						if (addressComponent.types.indexOf(lookup) != -1) {
							location[lookup] = addressComponent.long_name;
						}
					});
				});
			}
			d.resolve(location);
		});
		return d.promise;
	};

	$scope.requery = function() {
		$location.path('/search/' + encodeURIComponent($scope.query));
	};

	$scope.retrieveData = function() {
		$scope.locationError = false;
		$scope.uvLoading = true;
		$scope.waterLoading = true;
		$scope.violations = [];
		$scope.facilities = [];
		$scope.affectedFacilities = [];
		$scope.location = '';
		$scope.getQueryZipcode().then(function(location) {
			if (location.postal_code || (location.locality && location.administrative_area_level_1)) {
				$scope.getUVData(location);
				$scope.getWaterQualityData(location);
			} else {
				$scope.locationError = true;
				$scope.uvLoading = false;
				$scope.waterLoading = false;
			}
		});
	};

	$scope.getUVData = function(location) {
		var urlQuery = location.postal_code ? 'ZIP/' + location.postal_code : 'CITY/' + location.locality.toUpperCase() + '/STATE/' + states[location.administrative_area_level_1];
		$http.jsonp(uvRoot + urlQuery + '/JSONP?callback=JSON_CALLBACK').success(function(data) {
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

	$scope.getWaterQualityData = function(location) {
		var urlQuery = location.postal_code ? 'ZIP_CODE/' + location.postal_code : 'CITY_NAME/' + location.locality.toUpperCase() + '/STATE_CODE/' + states[location.administrative_area_level_1];
		$http.jsonp(waterRoot + urlQuery + '/JSONP?callback=JSON_CALLBACK').success(function(facilities) {
			$scope.facilities = facilities;
			if (facilities.length == 0) {
				$scope.waterLoading = false;
			} else {
				$q.all(facilities.map(function(facility) {
					return $http.jsonp(violationRoot + facility.PWSID + '/JSONP?callback=JSON_CALLBACK').success(function(results) {
						results.forEach(function(violation) {
							violation.facility = facility;
						});
						if (results.length != 0) {
							$scope.affectedFacilities.push(facility);
						}
						$scope.violations = $scope.violations.concat(results);
					});
				})).then(function() {
					$scope.waterLoading = false;
				});
			}
		}).error(function() {
			$scope.facilities = [];
			$scope.waterLoading = false;
		});
	};

	$scope.selectViolationCategory = function(category) {
		$scope.currentCategory = category;
		$scope.currentViolations = $scope.getViolations(category);
		setTimeout(function() {
			$('#violation-modal').modal('show');
		}, 0);
	};

	$scope.getViolations = function(category) {
		return $filter('filter')($scope.violations, {VIOLATION_CATEGORY_CODE: category.code});
	};

	$scope.hasViolations = function(category) {
		return $scope.getViolations(category).length != 0;
	};

	$scope.retrieveData();
	$('#violation-modal').modal({
		blurring: true
	});
}]);

app.directive('enterKey', function() {
	return function($scope, $element, $attrs) {
		$element.bind('keydown keypress', function(e) {
			if (e.which === 13) {
				$scope.$apply(function() {
					$scope.$eval($attrs.enterKey);
				});
				e.preventDefault();
			}
		});
	}
});
