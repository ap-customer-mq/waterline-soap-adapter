'use strict';

var _ = require('lodash'),
  soap = require('soap'),
  WSSecurity = require('./security/WSSecurity');
  

module.exports = (function() {
  
  var connections = {};
  var _collections = {};
  
  var adapter = {
    
    syncable: false,

    defaults: {},

    registerConnection: function(connection, collections, cb) {
      if(!connection.identity) return cb(new Error('Connection is missing an identity.'));
      if(connections[connection.identity]) return cb(new Error('Connection is already registered.'));

      _.keys(collections).forEach(function(key) {
        _collections[key] = collections[key];
      });

      connections[connection.identity] = connection;
      cb();
    },

    teardown: function (conn, cb) {
      cb();
    },

    /**
     * The main function for the adapter, all calls will be made through this function.
     * @param {string} identity - The connection to be used. SUPPLIED BY WATERLINE.
     * @param {string} collection - The collection using this adapter. SUPPLIED BY WATERLINE.
     * @param {string} actionName - The name of the action in the model's configuration to use, e.g. 'create' or 'update', etc.
     * @param {Object} args - Args represent the object or objects being posted to the remote server
     *                          and are used to create the outgoing request's body.
     * @param {Object} context - An object containing context specific values used for interpolation, e.g. session, currentUser, request
     *                           params, etc.
     * @param {requestCallback} cb - The callback handler used when the request is finished.
     */
    request: function(identity, collection, actionName, args, context, cb) {
      var connection = connections[identity];
      var model = _collections[collection];
      
      var wsdlUrl = connection.wsdl;
      var wsSecurity = connection.wsSecurity;
      
      soap.createClient(wsdlUrl, function(err, client) {
        if (err) {
          return cb(err);
        }
        if (wsSecurity) {
          client.setSecurity(new WSSecurity(wsSecurity.username, wsSecurity.password, wsSecurity.passwordType, wsSecurity.useTimestamps || false));
        }
        
        var action = client[actionName];
        
        action(args, function(err, result) {
          cb(err, result);
        });
      });
      
    },

    identity: 'waterline-soap'
    
  };
  
  return adapter;
  
}());