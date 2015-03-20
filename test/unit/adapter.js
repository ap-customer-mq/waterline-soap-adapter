var adapter = require('../../'),
  assert = require('chai').assert,
  connections = require('../stubs/connections'),
  nock = require('nock'),
  util = require('util'),
  libxmljs = require('libxmljs'),
  stubs = require('../stubs/soap');

var getStationsStub = stubs.getStationsResponse;
var getStationsByStationModelResponse = stubs.getStationsByStationModelResponse;

var waterline, Station;

before(function(done) {
  var fn = require('../bootstrap-waterline');
  var collections = {
    "Station": require('../stubs/Station')
  };
  waterline = fn(connections, collections, function(err, ontology) {
    Station = ontology.collections['station'];
    done(err);
  });
});

describe('SOAP Adapter', function() {
  
  describe('Query Scopes', function() {
    
    it('should successfully invoke getStations call', function(done) {
      var args = { 
        organizationId: '1:ORG08313'
      };

      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(200, getStationsStub);

      Station.request('getStationsForOrganizationScope', args, {}, function(err, result) {
        assert.isNull(err);        
        assert.isArray(result);
        assert.equal(result.length, 3);
        done();
      });
    });
      
    it ('should successfully map fields', function(done) {
      var args = { 
        organizationId: '1:ORG08313'
      };
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(200, getStationsStub);

      Station.request('getStationsForOrganizationScope', args, {}, function(err, result) {
        assert.isNull(err);
        var first = result[0];
        assert.strictEqual(first.id, '1:87063');
        assert.strictEqual(first.stationManufacturer, 'Schneider');
        assert.strictEqual(first.stationModel, 'EV230PDRACG');
        assert.strictEqual(first.stationSerialNumber, '1307311001A0');
        assert.strictEqual(first.numPorts, 2);
        assert.strictEqual(first.organizationId, '1:ORG08313');
        assert.strictEqual(first.organizationName, 'SchneiderDemo');
        assert.strictEqual(first.sgId, '48981, 49683, 38623, 40815, 42613, 45487, 45677, 49167');
        assert.strictEqual(first.sgName, 'Demo, Raleigh Demo Stations, Public Stations, Available and In Use 2, OnRamp 3.5.1 Controlled Release2, Level 2 Ports, All OnRamp Stations, SouthEast');
        done();
      });
    });
    
    it('should not fail when it receives a 500 error', function(done) {
      var args = {
        organizationId: '1:ORG08313'
      };
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(500);
          
      /*Station.request('getStationsForOrganizationScope', args, {}, function(err, result) {
        // TODO - finish this test case
        
        done();
      });*/
      
      assert.fail('Not implemented', 'Implemented','Test case needs to be implemented');
      done();
    });
  });
});
