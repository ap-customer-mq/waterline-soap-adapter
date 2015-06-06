'use strict';

var _ = require('lodash'),
  soap = require('soap'),
  WSSecurity = require('./security/WSSecurity'),
  util = require('util'),
  libxmljs = require('libxmljs'),
  inflection = require('inflection'),
  handlebars = require('handlebars');

var mappingRegex = /(\[?\@?[\w\:]+\]?)/g;

function executeCallbacks(model, lifecycle, actionName, options, cb) {
  var methodName = lifecycle + inflection.camelize(actionName);
  if(_.isFunction(model[methodName])) {
    return model[methodName](options, cb);
  }
  return cb();
}

function interpolate(source, context) {
    if (!source) return '';
    if (!_.isString(source)) source = source.toString();
    if (source.indexOf('{{') === -1) return source;

    var template = handlebars.compile(source);
    return template(context);
};

function buildRequest(soapAction, args) {
    if (soapAction.defaultParameters) args = _.merge(_.cloneDeep(soapAction.defaultParameters), args);

    if (soapAction.bodyPayloadTemplate) return interpolate(soapAction.bodyPayloadTemplate, args);

    var requestMapping =  soapAction.mapping ? soapAction.mapping.request : null;

    var mappedArgs = {};
    if (requestMapping) {
      _.each(_.keys(requestMapping), function(key) {
        if (typeof args[key] === 'undefined') {
          return;
        }

        var value = requestMapping[key];

        var tokens = value.match(mappingRegex);
        if (tokens) {
          var current = mappedArgs;
          var lastToken = null;

          for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];

            if (token.indexOf('[') === 0 && token.indexOf(']') === token.length - 1) {
              token = token.substring(1, token.length-1);
            }

            if (i === tokens.length - 1) {
              if (token.charAt(0) === '@') {
                if (args[key]) {
                  if (!current['$attributes']) {
                    current['$attributes'] = {};
                  }

                  current['$attributes'][token.substring(1)] = args[key];
                }
              } else {
                if (args[key]) {
                  current[token] = current[token] || {};
                  current[token]['$value'] = args[key];
                }
              }
            } else {
              if (!current[token]) {
                current[token] = {};
              }
              current = current[token];
            }
          }
        }

      });

    }


    return mappedArgs;
};

function castField(fieldType, field) {
    if (fieldType === 'integer' || fieldType === 'float') {
        return Number(field);
    } else if (fieldType === 'text') {
        return field;
    } else if (fieldType === 'date' || fieldType === 'datetime') {
        return new Date(field).toJSON();
    } else if (fieldType === 'boolean') {
        return field === 'true';
    } else {
        throw new Error("id field of type " + idType + " is not supported!");
    }
}

function mapResponse(model, soapAction, body) {
    var xmlDoc = libxmljs.parseXml(body);
    var results = xmlDoc.find(soapAction.pathSelector, soapAction.namespaces);

    var responseMapping = soapAction.mapping ? soapAction.mapping.response : null;

    // parse body as XML
    var parsedBody = libxmljs.parseXml(body);

    // run path selector (if available) to extract a specific piece of the response body
    if (soapAction.pathSelector) parsedBody = parsedBody.find(soapAction.pathSelector, soapAction.namespaces);

    if (!_.isArray(parsedBody)) parsedBody = [ parsedBody ];

    results = [];
    _.each(parsedBody, function(item) {
      var obj = {};
      _.each(_.keys(responseMapping), function(key) {
        var value = item.get(responseMapping[key], soapAction.namespaces);
        if (!_.isString(value) && typeof value !== 'undefined' && value !== null) value = value.toString();

        obj[key] = castField(model.attributes[key].type, value);
      });

      results.push(new model._model(obj, {}));
    });
    return results;

};

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

      var wsdlOptions = {
        attributesKey: '$attributes'
      };

      soap.createClient(wsdlUrl, wsdlOptions, function(err, client) {
        if (err) {
          return cb(err);
        }
        if (wsSecurity) {
          client.setSecurity(new WSSecurity(wsSecurity.username, wsSecurity.password, wsSecurity.passwordType, wsSecurity.useTimestamps || false));
        }

        // For debugging
        client.on('request', function(requestBody) {
          sails.log.debug("Sending request to remote service : " + requestBody);
        });

        var soapAction = model.soap[actionName];
        var operationName = soapAction.operation;
        var soapMethod = client[operationName];

        if (!soapMethod) return cb("The requested SOAP operation '" + operationName + "' is not valid");

        // map request
        var request = buildRequest(soapAction, args);

        soapMethod(request, function(err, result, body, header) {
          if (err) {
            sails.log.debug("Recieved error from remote service: " + util.inspect(err));
            return cb(err);
          }

          sails.log.debug("Received response from remote service : " + body);

          var mappedResponse = mapResponse(model, soapAction, body);

          cb(null, mappedResponse);
        });
      });

    },

    identity: 'waterline-soap'

  };

  return adapter;

}());
