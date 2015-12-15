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

var locationArray = [];

module.exports = {
	init: function() {
		pullFtpFile(locationsUri)
		.then(function(targetLocation) {
			locationArray = parseLocationFile(targetLocation);
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
