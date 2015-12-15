var jsftp = require('jsftp');

var config = {};
try {
	config = require('../config');
} catch (e) {
	console.log('Can\'t find local config, using the defaults.');
}

var locationsHost = 'ftp.airnowapi.org';
var locationsUri = '/Locations/monitoring_site_locations.dat';

module.exports = {
	init: function() {
		loadLocationFile();
	}
};

function loadLocationFile() {
	var targetLocation = pullLocationFile();
}

function pullLocationFile() {
	var ftp = new jsftp({
		host: locationsHost,
		user: config.airnowUsername,
		pass: config.airnowPassword
	});
	var targetLocation = 'target/locations.dat';
	ftp.get(locationsUri, targetLocation, function(hadError) {
		if (hadError) {
			console.error('The locations file could not be received.');
		} else {
			console.log('Successfully pulled locations file.');
		}
	});
	return targetLocation;
}
