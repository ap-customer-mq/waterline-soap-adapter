var adapter = require('../../'),
  assert = require('chai').assert,
  connections = require('../stubs/connections'),
  nock = require('nock'),
  util = require('util'),
  libxmljs = require('libxmljs'),
  stubs = require('../stubs/soap'),
  _ = require('lodash');

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
    
    it('should gracefully handle SOAPFaults', function(done) {
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
    
    it('should gracefully handle SOAPFaults even when the client returns a 200 http status code', function(done) {
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
    
    it('should gracefully handle HTTP errors that do not result in a SOAPFault', function(done) {
      var args = { 
        organizationId: '1:ORG08313'
      };

      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(404, "Not found");

      Station.request('getStationsForOrganizationScope', args, {}, function(err, result) {
        assert.isNotNull(err);
        assert.equal(404, err.response.statusCode);
        assert.equal("Not found", err.response.body);
        done();
      });
    });
    
  });
  
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
    
    it ('should not pass any fields in the request body if there are no request field mappings', function(done) {
      var args = {
        stationId: '1:87063'
      };
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1', function(body) {
            assert(body.indexOf("<soap:Body><tns:getStations xmlns:tns=\"urn:dictionary:com.chargepoint.webservices\"></tns:getStations></soap:Body>") !== -1, 'expected request body not to contain any fields');
            return body.indexOf("<soap:Body><tns:getStations xmlns:tns=\"urn:dictionary:com.chargepoint.webservices\"></tns:getStations></soap:Body>") !== -1;
          })
          .reply(200, getStationsStub);
      
      Station.request('scopeWithNoRequestMappings', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 3);
        done();
      });
    });
    
    it ('should return an object with no properties for each result when no response mappings are provided', function(done) {
      var args = {};
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(200, getStationsStub);
      
      Station.request('scopeWithNoResponseMappings', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 3);
        for (var i = 0; i < 3; i++) { assert(_.isEmpty(result[i].toObject())); }
        done();
      });
    });
    
    it ('should gracefully handle a response where the path selector does not select a valid node', function(done) {
      var args = {};

      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(200, getStationsStub);
      
      Station.request('scopeWithBogusPathSelector', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 0);
        done();
      });
    });
    
    it ('should gracefully handle no request mapping element', function(done) {
      var args = {
        stationId: '1:87063'
      };
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1', function(body) {
            assert(body.indexOf("<soap:Body><tns:getStations xmlns:tns=\"urn:dictionary:com.chargepoint.webservices\"></tns:getStations></soap:Body>") !== -1, 'expected request body not to contain any fields');
            return body.indexOf("<soap:Body><tns:getStations xmlns:tns=\"urn:dictionary:com.chargepoint.webservices\"></tns:getStations></soap:Body>") !== -1;
          })
          .reply(200, getStationsStub);
      
      Station.request('scopeWithNullRequestMapping', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 3);
        done();
      });      
    });
    
    it ('should gracefully handle no response mapping element', function(done) {
      var args = {};
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(200, getStationsStub);
      
      Station.request('scopeWithNullResponseMapping', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 3);
        for (var i = 0; i < 3; i++) { assert(_.isEmpty(result[i].toObject())); }
        done();
      });
    });

    it ('should gracefully handle no mapping element', function(done) {
      var args = {};
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(200, getStationsStub);
      
      Station.request('scopeWithNullMapping', args, {}, function(err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.equal(result.length, 3);
        for (var i = 0; i < 3; i++) { assert(_.isEmpty(result[i].toObject())); }
        done();
      });
    });
    
    
    it ('should not fail if no pathSelector is provided', function(done) {
      var args = {};
      
      nock('https://webservices.chargepoint.com')
          .post('/webservices/chargepoint/services/4.1')
          .reply(200, getStationsStub);
      
      Station.request('scopeWithNoPathSelector', args, {}, function(err, result) {
        assert.isNull(err);
        
        assert.isArray(result);
        assert.equal(result.length, 1);

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
