var app = angular.module('epaApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: '/app/partials/landing.html',
		controller: 'LandingCtrl'
	}).
	when('/search/:query', {
		templateUrl: '/app/partials/results.html',
		controller: 'ResultsCtrl'
	}).
	otherwise({
		redirectTo: '/'
	});
}]);

app.controller('LandingCtrl', ['$scope', '$location', function($scope, $location) {
	$('#search').focus();

	$scope.search = function() {
		if ($scope.query && $scope.query.length !== 0) {
			$location.path('/search/' + encodeURIComponent($scope.query));
		}
	};
}]);

app.controller('ResultsCtrl', ['$scope', '$http', '$filter', '$location', '$routeParams', '$q', 'googleFactory', function($scope, $http, $filter, $location, $routeParams, $q, googleFactory) {
	var uvRoot = 'https://iaspub.epa.gov/enviro/efservice/getEnvirofactsUVDAILY/';
	var waterRoot = 'https://iaspub.epa.gov/enviro/efservice/WATER_SYSTEM/';
	var violationRoot = 'https://iaspub.epa.gov/enviro/efservice/VIOLATION/PWSID/';

	$scope.counter = 3;
	$scope.waterViolationCodes = [{
		label: 'Maximum Contaminant Level',
		code: 'MCL'
	}, {
		label: 'Maximum Residual Disinfectant Level',
		code: 'MRDL'
	}, {
		label: 'Treatment Technique',
		code: 'TT'
	}];
	$scope.airQualityCodes = {
		'Good': {
			color: '#00E400',
			desc: 'Air quality is considered satisfactory, and air pollution poses little or no risk'
		},
		'Moderate': {
			color: '#FFFF00',
			desc: 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.'
		},
		'Unhealthy for Sensitive Groups': {
			color: '#FF7E00',
			desc: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.'
		},
		'Unhealthy': {
			color: '#FF0000',
			desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.'
		},
		'Very Unhealthy': {
			color: '#99004C',
			desc: 'Health warnings of emergency conditions. The entire population is more likely to be affected.'
		},
		'Hazardous': {
			color: '#4C0026',
			desc: 'Health alert: everyone may experience more serious health effects.'
		},
	};

	$scope.query = decodeURIComponent($routeParams.query);
	$http.get('/data/contaminant_codes.json').then(function(response) {
		$scope.contaminantCodes = response.data;
		$scope.counter--;
	});
	$http.get('/data/air_contaminant_desc.json').then(function(response) {
		$scope.airContaminantDescriptions = response.data;
		$scope.counter--;
	});
	$scope.uvLoading = false;
	$scope.waterLoading = false;
	$scope.airLoading = false;
	$scope.violations = [];

	$http.get('/data/states.json').then(function(response) {
		$scope.states = response.data;
		$scope.counter--;
	});

	$scope.requery = function() {
		if ($scope.query && $scope.query.length !== 0) {
			$location.path('/search/' + encodeURIComponent($scope.query));
		}
	};

	$scope.retrieveData = function() {
		$scope.locationError = false;
		$scope.uvLoading = true;
		$scope.waterLoading = true;
		$scope.airLoading = false;
		$scope.violations = [];
		$scope.facilities = [];
		$scope.affectedFacilities = [];
		$scope.location = '';
		googleFactory.getQueryZipcode($scope.query).then(function(locationObject) {
			$scope.location = locationObject.address;
			var loc = locationObject.location;
			if (loc.country == 'United States' && (loc.postal_code || (loc.locality && loc.administrative_area_level_1))) {
				$scope.getUVData(locationObject.location);
				$scope.getWaterQualityData(locationObject);
				$scope.getAirQualityData(locationObject.lat, locationObject.lng);
			} else {
				$scope.locationError = true;
				$scope.uvLoading = false;
				$scope.waterLoading = false;
				$scope.airLoading = false;
			}
		});
	};

	$scope.getUVData = function(location) {
		var urlQuery = location.postal_code ? 'ZIP/' + location.postal_code : 'CITY/' + location.locality.toUpperCase() + '/STATE/' + $scope.states[location.administrative_area_level_1];
		$http.jsonp(uvRoot + urlQuery + '/JSONP?callback=JSON_CALLBACK').success(function(data) {
			if (data.length === 0) {
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

	$scope.getWaterQualityData = function(locationObject) {
		var location = locationObject.location;
		var urlQuery = location.postal_code ? 'ZIP_CODE/' + location.postal_code : 'CITY_NAME/' + location.locality.toUpperCase() + '/STATE_CODE/' + $scope.states[location.administrative_area_level_1];
		$http.jsonp(waterRoot + urlQuery + '/JSONP?callback=JSON_CALLBACK').success(function(facilities) {
			$scope.facilities = facilities;
			if (facilities.length === 0) {
				$scope.waterLoading = false;
			} else {
				$q.all(facilities.map(function(facility) {
					return $http.jsonp(violationRoot + facility.PWSID + '/JSONP?callback=JSON_CALLBACK').success(function(results) {
						var nonMonitoringViolations = results.filter(function(result) {
							return result.VIOLATION_CATEGORY_CODE != 'MR' && result.VIOLATION_CATEGORY_CODE != 'Other' ;
						});
						nonMonitoringViolations.forEach(function(violation) {
							violation.facilityName = decodeURIComponent(facility.PWS_NAME);
							violation.facility = facility;
							violation.contaminantName = $scope.contaminantCodes[violation.CONTAMINANT_CODE];
							violation.startDate = moment(violation.COMPL_PER_BEGIN_DATE, 'DD-MMM-YY');
						});
						if (nonMonitoringViolations.length !== 0) {
							$scope.affectedFacilities.push(facility);
							if (!$scope.map) {
								setTimeout(function() {
									$scope.map = googleFactory.initMap('map', locationObject.lat, locationObject.lng);
									$scope.$apply();
								}, 0);
							}
							setTimeout(function() {
								googleFactory.addFacility($scope.map, facility);
							}, 0);
						}
						$scope.violations = $scope.violations.concat(nonMonitoringViolations);
						setTimeout(function() {
							$('.ui.accordion').accordion();
							$('[data-html]').popup({
								position: 'top center',
								html: $(this).attr('data-html'),
								hoverable: true
							});
						}, 0);
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

	$scope.getViolations = function(category) {
		return category ? $filter('filter')($scope.violations, {VIOLATION_CATEGORY_CODE: category.code}) : [];
	};

	$scope.getViolationDates = function(category) {
		var dates = $scope.getViolations(category).map(function(violation) {
			return violation.startDate;
		});
		return [moment(Math.min.apply(null, dates)).format('MM/YYYY'), moment(Math.max.apply(null, dates)).format('MM/YYYY')];
	};

	$scope.getViolationFacilities = function(category) {
		var violations = $scope.getViolations(category);
		var facilities = violations.map(function(violation) {
			return violation.facility;
		});
		return facilities.filter(function(elem, pos) {
			return facilities.indexOf(elem) == pos;
		});
	};

	$scope.getRecentViolations = function() {
		return $filter('filter')($scope.violations, $scope.isRecentViolation);
	};

	$scope.isRecentViolation = function(violation) {
		var recentCutoff = moment().subtract(1, 'years').toDate().getTime();
		return violation.startDate.toDate().getTime() >= recentCutoff;
	};

	$scope.hasViolations = function(category) {
		return $scope.getViolations(category).length !== 0;
	};

	/* Air Quality */
	$scope.getAirQualityData = function(lat, lng) {
		$http.get('/airnow/search?lat=' + lat + '&lng=' + lng).then(function(response) {
			$scope.airData = response.data;
			setTimeout(function() {
				$('[data-content]').popup({
					position: 'top center'
				});
				$('[data-html]').popup({
					position: 'top center',
					html: $(this).attr('data-html'),
					hoverable: true
				});
			}, 0);
		});
	};

	$scope.truncateDate = function(date) {
		return moment(date, 'MM/DD/YY').format('ddd MMM D');
	};

	/* Sortable Table */
	$scope.tableHeaders = [{
		label: 'Facility Name',
		field: 'facilityName',
		desc: 'Facilities could be any of the following three types:<ul><li>Community Water Systems: Water Systems that serve the same people year-round (e.g. in homes or businesses).</li><li>Non-Transient Non-Community Water Systems: Water Systems that serve the same people, but not year-round (e.g. schools that have their own water system).</li><li> Transient Non-Community Water Systems: Water Systems that do not consistently serve the same people (e.g. rest stops, campgrounds, gas stations).</li></ul>'
	}, {
		label: 'Contaminant Name',
		field: 'contaminantName'
	}, {
		label: 'Violation Date',
		field: 'startDate'
	}];
	$scope.sortField = 'startDate';
	$scope.reverse = true;

	$scope.changeSort = function(field) {
		if ($scope.sortField == field) {
			$scope.reverse = !$scope.reverse;
		} else {
			$scope.sortField = field;
			$scope.reverse = false;
		}
	};

	$scope.$watch('counter', function() {
		if ($scope.counter === 0) {
			$scope.retrieveData();
		}
	});

	$('[data-label]').toArray().forEach(function(me) {
		var contentId = $(me).attr('data-label');
		$(me).popup({
			position: 'top center',
			html: $('#' + contentId).html()
		});
	});
}]);

app.factory('googleFactory', ['$q', function($q) {
	var service = {};

	var geocoder = new google.maps.Geocoder();
	var addressComponentLookup = [
		'postal_code',
		'locality',
		'administrative_area_level_1',
		'country'
	];
	var previousInfoWindow = false;

	var constructLocationObject = function(result) {
		var location = {};
		result.address_components.forEach(function(addressComponent) {
			addressComponentLookup.forEach(function(lookup) {
				if (addressComponent.types.indexOf(lookup) != -1) {
					location[lookup] = addressComponent.long_name;
				}
			});
		});
		return location;
	};

	service.getQueryZipcode = function(query) {
		var d = $q.defer();
		geocoder.geocode({'address': query}, function(results, status) {
			if (results && results.length !== 0) {
				d.resolve({
					address: results[0].formatted_address,
					location: constructLocationObject(results[0]),
					lat: results[0].geometry.location.lat(),
					lng: results[0].geometry.location.lng()
				});
			} else {
				d.resolve({});
			}
		});
		return d.promise;
	};

	service.initMap = function(id, lat, lng) {
		var map = new google.maps.Map(document.getElementById(id), {
			center: {lat: lat, lng: lng},
			zoom: 11
		});
		return map;
	};

	var constructFacilityAddressQuery = function(facility) {
		return (facility.ADDRESS_LINE2 ? facility.ADDRESS_LINE2 : facility.ADDRESS_LINE1) + ' ' + facility.CITY_NAME + ' ' + facility.STATE_CODE;
	};

	var constructFacilityInfo = function(facility) {
		var html = '<h2>' + facility.PWS_NAME + '</h2>';
		html += '<p>' + constructFacilityAddressQuery(facility) + '</p>';
		return html;
	};

	service.addFacility = function(map, facility) {
		service.getQueryZipcode(constructFacilityAddressQuery(facility)).then(function(location) {
			var infowindow = new google.maps.InfoWindow({
				content: constructFacilityInfo(facility)
			});
			var marker = new google.maps.Marker({
				map: map,
				position: {
					lat: location.lat,
					lng: location.lng,
					title: facility.PWS_NAME
				}
			});
			marker.addListener('click', function() {
				if (previousInfoWindow) {
					previousInfoWindow.close();
				}
				previousInfoWindow = infowindow;
				infowindow.open(map, marker);
			});
		});
	};

	return service;
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
	};
});
