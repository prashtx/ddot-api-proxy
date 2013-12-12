/*jslint node: true, indent: 2, sloppy: true, white: true, vars: true */

var http = require('http');
var request = require('request');
var u = require('url');
var connect = require('connect');

var API = process.env.OBA_API;
var port = process.env.PORT || 3001;

var app = connect();
var server = http.createServer(app);

app.use(connect.compress())
.use(function (req, resp) {
  var parts = u.parse(req.url, true);
  parts.query.key = 'BETA';
  parts.search = undefined;
  parts = u.parse(u.format(parts));
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


server.listen(port, function () {
  console.log('Listening on ' + port);
});
