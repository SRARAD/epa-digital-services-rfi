var rewire = require('rewire');
var assert = require('assert');
var fs = require('fs');
var airnow = rewire('../../src/airnow.js');

describe('AirNow#createReportingAreaObject', function() {
	var createReportingAreaObject = airnow.__get__('createReportingAreaObject');
	var targetLocation = './test/src/test-reporting-area.dat';
	var rawData = fs.readFileSync(targetLocation, 'utf-8');
	var reportingAreaObject = createReportingAreaObject(rawData);
	it('Reporting Area Object Key Set Size', function() {
		assert.equal(Object.keys(reportingAreaObject).length, 25);
	});
	it('Reporting Area Object Item Keys', function() {
		var firstLocation = reportingAreaObject[Object.keys(reportingAreaObject)[0]];
		var locationObjectKeys = Object.keys(firstLocation).sort();
		var expectedKeys = ['forecasts', 'lat', 'location', 'lng'].sort();
		assert.deepEqual(locationObjectKeys, expectedKeys);
	});
});

describe('AirNow#reduceReportingAreaObject', function() {
	var reduceReportingAreaObject = airnow.__get__('reduceReportingAreaObject');
	var targetLocation = './test/src/test-reporting-area-object.json';
	var reportingAreaObject = JSON.parse(fs.readFileSync(targetLocation, 'utf-8'));
	var reducedReportingArea = reduceReportingAreaObject(reportingAreaObject);
	it('Reduced Reporting Object Size', function() {
		assert.equal(reducedReportingArea.length, 25);
	});
	it('Reporting Area Object Item Keys', function() {
		var firstLocation = reducedReportingArea[0];
		var locationObjectKeys = Object.keys(firstLocation).sort();
		var expectedKeys = ['forecasts', 'lat', 'location', 'lng', 'forecastDates'].sort();
		assert.deepEqual(locationObjectKeys, expectedKeys);
	});
	it('Reduced Reporting Object Forecast Dates Length', function() {
		var forecastDateSizeArray = reducedReportingArea.map(function(reportingArea) {
			return reportingArea.forecastDates.length;
		});
		assert(Math.min.apply(null, forecastDateSizeArray) <= 5);
	});
});

describe('AirNow#calculateLatLngDistance', function() {
	var calculateLatLngDistance = airnow.__get__('calculateLatLngDistance');
	it('Ann Arbor to DC Distance', function() {
		var annArborLat = 42.280826;
		var annArborLng = -83.743038;
		var dcLat = 38.907192;
		var dcLng = -77.036871;
		var actual = calculateLatLngDistance(annArborLat, annArborLng, dcLat, dcLng);
		var expected = 366.98;
		assert(Math.abs((actual - expected) / expected) < 0.05);
	});
});
