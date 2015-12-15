var express = require('express');
var airnow = require('./src/airnow.js');

var app = express();

app.use(express.static('public'));

airnow.init();

app.get('/airnow/search', function(req, res) {
	res.send(JSON.stringify(airnow.getLatLngData(parseFloat(req.query.lat), parseFloat(req.query.lng))));
});

var server = app.listen(8080, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
