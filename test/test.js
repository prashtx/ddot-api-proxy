var async = require('async');
var nock = require('nock');
var request = require('supertest');
var should = require('should');
var server = require('../proxy');

var KEY = 'validkey';
var SAMPLE_RESPONSE = {'data': 'sample data'};

function nockMe(msDelay) {
  if (!msDelay) {
    msDelay = 0;
  }

  var scope = nock('http://example.com')
    .filteringPath(function(path){
        return '/'; //capture every request with this mock
    })
    .defaultReplyHeaders({
      'Content-Type': 'application/json'
    })
    .get('/')
    .delay(msDelay)
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
    request(server.app)
      .get(`/api/api/where/agencies-with-coverage.json?key=badkey&format=json`)
      .expect(403, 'Invalid API Key', done)
  });
});


describe('Heavy load situations', function() {
  it('drops slow requests', function(done) {
    nockMe(10000);
    request(server.app)
      .get(`/api/api/where/agencies-with-coverage.json?key=${KEY}&format=json`)
      .expect(504, done)
  });

  it('drops requests if too many pile up', function(done) {
    var agent = request.agent(server.app);

    // Make all our requests too slow
    Array(31).fill().map((_, i) => {
      nockMe(10000);
    });

    // Fire off MAX_REQUESTS worth of requests we don't care about
    function task() {
      agent.get(`/api/api/where/agencies-with-coverage.json?key=${KEY}&format=json`)
           .end();
    }
    async.times(30, task, function() {});

    // This last one should fail.
    agent
      .get(`/api/api/where/agencies-with-coverage.json?key=${KEY}&format=json`)
      .expect(503, function(error) {
        nock.cleanAll(); // in case there are pending / unused nocks
        done(error);
      });
  });

  xit('picks back up after things calm down', function(done) {
    var agent = request.agent(server.app);

    // Make all our requests too slow
    Array(31).fill().map((_, i) => {
      nockMe(2000);
    });

    function get() {
      agent.get(`/api/api/where/agencies-with-coverage.json?key=${KEY}&format=json`)
           .end(function() { }); // handle end otherwise supertest dies on 503s
    }
    var gets = Array(31).fill(get);
    async.parallel(gets); 
    
    // Wait a while for all those resolve...
    setTimeout(function() {
      agent
        .get(`/api/api/where/agencies-with-coverage.json?key=${KEY}&format=json`)
        .expect(200, done);
    }, 3000);
  });
});


