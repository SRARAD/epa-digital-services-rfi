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
		console.log('Pulling Locations Data');
		pullFtpFile(hourlyUriRoot + constructHourlyFileName())
		.then(function(targetLocation) {
			locationArray = parseLocationFile(targetLocation);
		})
		.then(function() {
			console.log('Pulling Hourly Data');
			return pullFtpFile(locationsUri);
		})
		.then(function(targetLocation) {
			hourlyDataObject = parseHourlyData(targetLocation);
		})
		.catch(function(error) {
			console.log(error);
		});
	}
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

function parseLocationFile(targetLocation) {
	var rawData = fs.readFileSync(targetLocation, 'utf-8');
	return rawData.split('\n').map(function(row) {
		var columns = row.split('|');
		return {
			id: columns[0],
			lat: columns[8],
			lng: columns[9]
		};
	}).filter(function(obj) {
		return obj.id;
	});
}

function parseHourlyData(targetLocation) {
	var rawData = fs.readFileSync(targetLocation, 'utf-8');
	return rawData.split('\n').reduce(function(all, row) {
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

function constructHourlyFileName() {
	var date = new Date();
	return date.getFullYear().toString() + date.getUTCMonth().toString() + date.getUTCDate().toString() + date.getUTCHours().toString() + '.dat';
}
