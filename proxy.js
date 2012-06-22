/*jslint node: true, indent: 2, sloppy: true, white: true, vars: true */

var http = require('http');
var request = require('request');
var u = require('url');

var API = process.env.OBA_API;

var server = http.createServer(function (req, resp) {
  var parts = u.parse(req.url);
  var url = API + parts.pathname + parts.search;

  resp.setHeader('Access-Control-Allow-Origin', '*');
  var headers = {};
  var h;
  for (h in req.headers) {
    if (req.headers.hasOwnProperty(h)) {
      headers[h] = req.headers[h];
    }
  }
  headers['Cache-Control'] = 'max-age=0';
  req.pipe(request({url: url, headers: headers})).pipe(resp);
});

var port = process.env.PORT || 3001;
server.listen(port, function () {
  console.log('Listening on ' + port);
});
