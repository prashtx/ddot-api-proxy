/*jslint node: true, indent: 2, sloppy: true, white: true, vars: true */
'use strict';

var http = require('http');
var request = require('request');
var u = require('url');
var connect = require('connect');
var settings = require('./lib/settings');

var API = settings.api;
var port = settings.port;

var app = connect();
var server = http.createServer(app);

app.use(connect.compress())
.use(function (req, resp) {
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
  var obaResponse = req.pipe(request({ url: url, headers: headers }));
  obaResponse.pipe(resp);
  obaResponse.on('error', function (error) {
    console.log('Error sending request to the actual OBA server');
    console.log(error);
    resp.statusCode = 500;
    resp.end('Internal Server Error');
  });
});


server.listen(port, function () {
  console.log('Listening on ' + port);
});
