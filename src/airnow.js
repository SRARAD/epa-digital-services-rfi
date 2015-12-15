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
var locationsUri = '/Locations/monitoring_site_locations.dat';
var hourlyUriRoot = '/HourlyData/';

var locationArray = [];
var hourlyDataObject = {};

module.exports = {
	init: function() {
		console.log('Pulling Hourly Data');
		pullFtpFile(hourlyUriRoot + constructHourlyFileName())
		.then(function(targetLocation) {
			hourlyDataObject = parseHourlyData(targetLocation);
		})
		.then(function() {
			console.log('Pulling Locations Data');
			return pullFtpFile(locationsUri);
		})
		.then(function(targetLocation) {
			locationArray = parseLocationFile(targetLocation, Object.keys(hourlyDataObject));
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

function parseLocationFile(targetLocation, readingLocationIds) {
	var rawData = fs.readFileSync(targetLocation, 'utf-8');
	return rawData.split('\r\n').map(function(row) {
		var columns = row.split('|');
		return {
			id: columns[0],
			lat: columns[8],
			lng: columns[9]
		};
	}).filter(function(obj) {
		return obj.id && readingLocationIds.indexOf(obj.id) != -1;
	});
}

function parseHourlyData(targetLocation) {
	var rawData = fs.readFileSync(targetLocation, 'utf-8');
	return rawData.split('\r\n').reduce(function(all, row) {
		var columns = row.split('|');
		if (!all[columns[2]]) {
			all[columns[2]] = {
				date: columns[0] + ' ' + columns[1],
				location: columns[3],
				name: columns[8],
				readings: []
			};
		}
		all[columns[2]].readings.push({
			label: columns[5],
			units: columns[6],
			value: columns[7]
		});
		return all;
	}, {});
}

function getLatLngData(lat, lng) {
	if (locationArray.length !== 0) {
		var sortedLocations = locationArray.sort(function(loc1, loc2) {
			return calculateLatLngDistance(loc1.lat, loc1.lng, lat, lng) - calculateLatLngDistance(loc2.lat, loc2.lng, lat, lng);
		});
		var closestLocation = sortedLocations[0];
		return hourlyDataObject[closestLocation.id];
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

function constructHourlyFileName() {
	var date = new Date();
	return date.getFullYear().toString() + (date.getUTCMonth() + 1).toString() + date.getUTCDate().toString() + (date.getUTCHours() - 1).toString() + '.dat';
}
