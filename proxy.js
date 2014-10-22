/*jslint node: true, indent: 2, sloppy: true, white: true, vars: true */
'use strict';

var http = require('http');
var u = require('url');

var compression = require('compression');
var connect = require('connect');
var request = require('request');

var settings = require('./lib/settings');

var API = settings.api;
var port = settings.port;

var app = connect();
var server = http.createServer(app);

var count = 0;

app.use(compression())
.use(function (req, resp) {
  count += 1;
  console.log('info active_requests=' + count);

  req.client.on('close', function () {
    count -= 1;
    console.log('info active_requests=' + count);
  });

  var parts = u.parse(req.url, true);
  var inboundKey = parts.query.key;

  // Check if the provided key is valid.
  if (settings.keys.indexOf(inboundKey) === -1) {
    // Invalid key. Send a 403.
    resp.statusCode = 403;
    resp.end('Invalid API Key');
    return;
  }

  // Replace it with our internal OneBusAway key
  parts.query.key = settings.apiKey;
  parts.search = undefined;
  parts = u.parse(u.format(parts));
  var url = API + parts.pathname + parts.search;

  // Add CORS headers
  resp.setHeader('Access-Control-Allow-Origin', '*');

  // Copy headers from the origin client request to our request
  var headers = {};
  Object.keys(req.headers).forEach(function (h) {
    headers[h] = req.headers[h];
  });

  // Add cache headers
  // This will override the client's Cache-Control header
  headers['Cache-Control'] = 'max-age=0';

  // Pipe the request
  var obaRequest = request({
    url: url,
    headers: headers,
    maxSockets: 100
  });

  var time;
  obaRequest.on('socket', function () {
    time = Date.now();
  });

  var obaResponse = req.pipe(obaRequest);
  obaResponse.pipe(resp);
  obaResponse.on('error', function (error) {
    console.log('Error sending request to the actual OBA server');
    console.log(error);
    resp.statusCode = 500;
    resp.end('Internal Server Error');
  });

  obaResponse.on('end', function () {
    if (time) {
      time = Date.now() - time;
      console.log('info service_time=' + time);
    }
  });
});


server.listen(port, function () {
  console.log('Listening on ' + port);
});
