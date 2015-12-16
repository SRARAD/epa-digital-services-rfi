var rewire = require('rewire');
var assert = require('assert');
var airnow = rewire('../../src/airnow.js');

describe('Airnow#calculateLatLngDistance', function() {
	var calculateLatLngDistance = airnow.__get__('calculateLatLngDistance');
	it("Ann Arbor to DC Distance", function() {
		var annArborLat = 42.280826;
		var annArborLng = -83.743038;
		var dcLat = 38.907192;
		var dcLng = -77.036871;
		var actual = calculateLatLngDistance(annArborLat, annArborLng, dcLat, dcLng);
		var expected = 366.98;
		assert(Math.abs((actual - expected) / expected) < 0.05);
	});
});
