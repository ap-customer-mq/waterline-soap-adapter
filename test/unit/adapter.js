var adapter = require('../../'),
  assert = require('chai').assert,
  connections = require('../stubs/connections'),
  nock = require('nock'),
  util = require('util'),
  libxmljs = require('libxmljs'),
  stubs = require('../stubs/soap');

var getStationsStub = stubs.getStationsResponse;
var getStationsByStationModelResponse = stubs.getStationsByStationModelResponse;
var getStationsByStationIdResponse = stubs.getStationsByStationIdResponse;
var exampleSoapFault = stubs.exampleSoapFault;

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
  
  describe('Exception scenarios', function() {
    
    it ('should gracefully handle an undefined operation', function(done) {
      Station.request('scopeWithInvalidOperation', {}, {}, function(err, result) {
        assert.equal(err, "The requested SOAP operation 'invalidWsdlOperation' is not valid");
        done();
      });
    });
    
    it('SOAPFaults should be gracefully handled', function(done) {
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(500, exampleSoapFault);
            
      Station.request('getStationsForOrganizationScope', {}, {}, function(err, result) {
        assert.isNotNull(err);
        assert.equal(err.body, exampleSoapFault);
        assert.equal(err.response.statusCode, 500);
        done();
      });
    });
    
    it('SOAPFaults should be gracefully handled even when the client returns a 200 http status code', function(done) {
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(200, exampleSoapFault);
            
      Station.request('getStationsForOrganizationScope', {}, {}, function(err, result) {
        assert.isNotNull(err);
        assert.equal(err.body, exampleSoapFault);
        assert.equal(err.response.statusCode, 200);
        done();
      });
    });
    
    // TODO - 404 and other error codes in which there's no SOAPFault
    
    // TODO - other exception scenarios
  });
  
  // TODO - tests for default behavior
  
  describe('CRUD Operations', function() {
    it('should handle CRUD scenarios', function(done) {
      assert.fail('Implement me!');
    });
    
    // TODO - finish crud scenarios
  });
  
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
    
    it ('should allow default parameters', function(done) {
      var args = {};
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1', function(body) { 
            assert(body.indexOf("<stationModel>EV230PDRACG</stationModel>") !== -1, 'expected request body to contain default value for stationModel parameter');
            return body.indexOf("<stationModel>EV230PDRACG</stationModel>") !== -1;
          })
          .reply(200, getStationsByStationModelResponse);
      
      Station.request('getStationByStationModelScope', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 2);
        done();
      });
    });
    
    it ('should parse request mappings', function(done) {
      
      var args = {
        stationId: "1:87063"
      };
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1', function(body) { 
            assert(body.indexOf("<searchQuery><stationID>1:87063</stationID></searchQuery>") !== -1, 'expected request body to contain default value for stationID parameter');
            return body.indexOf("<searchQuery><stationID>1:87063</stationID></searchQuery>") !== -1;
          })
          .reply(200, getStationsByStationIdResponse);
      
      Station.request('getStationByStationIdScope', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 1);
        done();
      });
    });
    
    it ('should handle default behavior if no request mappings are provided (TODO - rewrite description of this case)', function(done) {
      assert.fail("Implement me");
    }); 
    
    it ('should handle default behavior if no response mappings are provided (TODO - rewrite description of this case)', function(done) {
      assert.fail("Implement me");
    });
    
    it ('should handle default behavior if no pathSelector is provided (TODO - rewrite description of this case)', function(done) {
      assert.fail("Implement me");
    }); 
    
    it ('should allow namespaces in request mappings', function(done) {
      
      var args = {
        stationId: "1:87063"
      };
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1', function(body) { 
            assert(body.indexOf("<tns:searchQuery><tns:stationID>1:87063</tns:stationID></tns:searchQuery>") !== -1, 'expected request body to contain value for stationID parameter with specified namespaces');
            return body.indexOf("<tns:searchQuery><tns:stationID>1:87063</tns:stationID></tns:searchQuery>") !== -1;
          })
          .reply(200, getStationsByStationIdResponse);
      
      Station.request('getStationByStationIdWithNamespacedRequestMappingsScope', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 1);
        done();
      });
    });
    
  });
});
