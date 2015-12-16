describe('ResultsCtrl', function() {

	beforeEach(module('epaApp'));

	var ResultsCtrl, scope;

	beforeEach(inject(function ($rootScope, $controller) {
		scope = $rootScope.$new();
		ResultsCtrl = $controller('ResultsCtrl', {
			$scope: scope
		});
	}));

	it('check violation code array length', function () {
		expect(scope.waterViolationCodes.length).toEqual(4);
	});
});
