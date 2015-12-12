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

app.controller('ResultsCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
	$scope.query = decodeURIComponent($routeParams.query);
}]);