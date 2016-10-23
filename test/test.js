var nock = require('nock');
var request = require('supertest');
var should = require('should');
var server = require('../proxy');

var KEY = 'validkey';
var SAMPLE_RESPONSE = {'data': 'sample data'};

function nockMe(delay) {
  if (!delay) {
    delay = 0;
  }

  var scope = nock('http://example.com')
    .filteringPath(function(path){
        return '/'; //capture every request with this mock
    })
    .defaultReplyHeaders({
      'Content-Type': 'application/json'
    })
    .get('/')
    .reply(200, SAMPLE_RESPONSE);
}

describe('Basic requests', function() {
  it('responds with json', function(done) {
    nockMe();
    request(server.app)
      .get(`/api/api/where/agencies-with-coverage.json?key=${KEY}&format=json`)
      .expect('Content-Type', /json/)
      .expect(200, SAMPLE_RESPONSE, done)
  });

  it('bad keys fail', function(done) {
    nockMe();
    request(server.app)
      .get(`/api/api/where/agencies-with-coverage.json?key=badkey&format=json`)
      .expect(403, 'Invalid API Key', done)
  });
});
