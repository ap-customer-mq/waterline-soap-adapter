var adapter = require('../../'),
  assert = require('chai').assert,
  connections = require('../stubs/connections'),
  nock = require('nock'),
  util = require('util');

var waterline, Model;

before(function(done) {
  var fn = require('../bootstrap-waterline');
  var collections = {
    "V1Model": require('../stubs/V1Model')
  };
  waterline = fn(connections, collections, function(err, ontology) {
    Model = ontology.collections['v1model'];
    done(err);
  });
});

describe('Mocha', function() {
  it('should be set up correctly', function(done) {
    var args = { 
        'searchQuery': {
            'orgID': '1:ORG08313'
        }
    };
    
    Model.request('getStations', args, {}, function(err, result) {
      console.log('result: ' + util.inspect(result));
      assert.isNull(err);
      done();
    });
  });
});