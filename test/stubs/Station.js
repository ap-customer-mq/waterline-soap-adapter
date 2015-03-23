'use strict';

module.exports = {
    connection: 'test',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        id: {
            type: 'text'
        },
        stationManufacturer: {
            type: 'text'
        },
        stationModel: {
            type: 'text'
        },
        stationSerialNumber: {
            type: 'text'
        },
        numPorts: {
            type: 'integer'
        },
        organizationId: {
            type: 'text'
        },
        organizationName: {
            type: 'text'
        },
        sgId: {
            type: 'text'
        },
        sgName: {
            type: 'text'
        }
    },
    soap: {
        getStationsForOrganizationScope: {
            operation: 'getStations',
            namespaces: {
              'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
              'ns1': 'urn:dictionary:com.chargepoint.webservices'
            },
            pathSelector: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData',
            mapping: {
              response: {
                id: './stationID/text()',
                stationManufacturer: './stationManufacturer/text()',
                stationModel: './stationModel/text()',
                stationSerialNumber: './stationSerialNum/text()',
                numPorts: './numPorts/text()',
                organizationId: './orgID/text()',
                organizationName: './organizationName/text()',
                sgId: './sgID/text()',
                sgName: './sgName/text()'
              }
            },
            bodyPayloadTemplate: "<tns:getStations xmlns:tns=\"urn:dictionary:com.chargepoint.webservices\"><searchQuery><orgID>{{organizationId}}</orgID></searchQuery></tns:getStations>"
        },
        getStationByStationModelScope: {
            operation: 'getStations',
            namespaces: {
              'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
              'ns1': 'urn:dictionary:com.chargepoint.webservices'
            },
            pathSelector: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData',
            mapping: {
              response: {
                id: './stationID/text()',
                stationManufacturer: './stationManufacturer/text()',
                stationModel: './stationModel/text()',
                stationSerialNumber: './stationSerialNum/text()',
                numPorts: './numPorts/text()',
                organizationId: './orgID/text()',
                organizationName: './organizationName/text()',
                sgId: './sgID/text()',
                sgName: './sgName/text()'
              }
            },
            bodyPayloadTemplate: "<tns:getStations xmlns:tns=\"urn:dictionary:com.chargepoint.webservices\"><searchQuery><stationModel>{{stationModel}}</stationModel></searchQuery></tns:getStations>",
            defaultParameters: {
              'stationModel': 'EV230PDRACG'
            }
        },
        getStationByStationIdScope: {
            operation: 'getStations',
            namespaces: {
              'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
              'ns1': 'urn:dictionary:com.chargepoint.webservices'
            },
            pathSelector: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData',
            mapping: {
              request: {
                stationId: 'searchQuery[stationID]'
              },
              response: {
                id: './stationID/text()',
                stationManufacturer: './stationManufacturer/text()',
                stationModel: './stationModel/text()',
                stationSerialNumber: './stationSerialNum/text()',
                numPorts: './numPorts/text()',
                organizationId: './orgID/text()',
                organizationName: './organizationName/text()',
                sgId: './sgID/text()',
                sgName: './sgName/text()'
              }
            }
        },
        scopeWithInvalidOperation: {
          operation: 'invalidWsdlOperation',
          namespaces: {
            'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
            'ns1': 'urn:dictionary:com.chargepoint.webservices'
          }
        }
    }
};
