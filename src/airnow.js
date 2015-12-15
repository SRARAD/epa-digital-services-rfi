var jsftp = require('jsftp');
var Q = require('q');
var fs = require('fs');

var config = {};
try {
	config = require('../config');
} catch (e) {
	console.log('Can\'t find local config, using the defaults.');
}

var ftpHost = 'ftp.airnowapi.org';
var reportingAreaUri = '/ReportingArea/reportingarea.dat';

var reportingAreaArray = [];

module.exports = {
	init: function() {
		console.log('Pulling Reporting Area Data');
		pullFtpFile(reportingAreaUri)
		.then(function(targetLocation) {
			reportingAreaArray = parseReportingAreaFile(targetLocation);
		})
		.catch(function(error) {
			console.log(error);
		});
	},
	getLatLngData: getLatLngData
};

function pullFtpFile(fileUri) {
	var d = Q.defer();
	var ftp = new jsftp({
		host: ftpHost,
		user: config.airnowUsername,
		pass: config.airnowPassword
	});
	var targetLocation = 'target/temp.dat';
	ftp.get(fileUri, targetLocation, function(hadError) {
		if (hadError) {
			d.reject('The FTP file could not be received.');
		} else {
			console.log('Successfully pulled FTP file.');
			d.resolve(targetLocation);
		}
	});
	return d.promise;
}

function parseReportingAreaFile(targetLocation) {
	var rawData = fs.readFileSync(targetLocation, 'utf-8');
	var locationMap = rawData.split('\r\n').reduce(function(all, row) {
		var columns = row.split('|');
		var location =columns[7] + ', ' + columns[8];
		if (!all[location]) {
			all[location] = {
				location: location,
				lat: columns[9],
				lng: columns[10],
				forecasts: {}
			};
		}
		var contaminant = columns[11];
		if (!all[location].forecasts[contaminant]) {
			all[location].forecasts[contaminant] = {};
		}
		var forecastDate = columns[1];
		var aqi = columns[13];
		all[location].forecasts[contaminant][forecastDate] = aqi;
		return all;
	}, {});
	return Object.keys(locationMap).reduce(function(all, key) {
		var locationObject = locationMap[key];
		var forecasts = locationMap[key].forecasts;
		var forecastDates = Object.keys(forecasts).reduce(function(allDates, contaminant) {
			var curDates = Object.keys(forecasts[contaminant]);
			var duplicateDates = allDates.concat(curDates);
			return duplicateDates.filter(function(elem, pos) {
				return duplicateDates.indexOf(elem) == pos;
			});
		}, []).sort(function(date1, date2) {
			return new Date(date1) - new Date(date2);
		});
		locationObject.forecastDates = forecastDates;
		all.push(locationObject);
		return all;
	}, []).filter(function(obj) {
		return obj.location;
	});
}

function getLatLngData(lat, lng) {
	if (reportingAreaArray.length !== 0) {
		var sortedLocations = reportingAreaArray.sort(function(loc1, loc2) {
			return calculateLatLngDistance(loc1.lat, loc1.lng, lat, lng) - calculateLatLngDistance(loc2.lat, loc2.lng, lat, lng);
		});
		return sortedLocations[0];
	} else {
		return {
			error: 'No location data available.'
		};
	}
}

function calculateLatLngDistance(lat1, lng1, lat2, lng2) {
	var phi1 = lat1 * Math.PI / 180;
	var phi2 = lat2 * Math.PI / 180;
	var deltaPhi = (lat2 - lat1) * Math.PI / 180;
	var deltaLambda = (lng2 - lng1) * Math.PI / 180;
	var a = Math.pow(Math.sin(deltaPhi / 2), 2) + Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin(deltaLambda), 2);
	return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
