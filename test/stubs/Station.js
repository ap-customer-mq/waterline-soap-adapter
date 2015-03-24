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
        getStationByStationIdWithNamespacedRequestMappingsScope: {
            operation: 'getStations',
            namespaces: {
              'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
              'ns1': 'urn:dictionary:com.chargepoint.webservices'
            },
            pathSelector: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData',
            mapping: {
              request: {
                stationId: 'tns:searchQuery[tns:stationID]'
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
        },
        scopeWithNoRequestMappings: {
          operation: 'getStations',
          namespaces: {
            'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
            'ns1': 'urn:dictionary:com.chargepoint.webservices'
          },
          pathSelector: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData',
          mapping: {
            request: {
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
        scopeWithNoResponseMappings: {
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
              }
            }
        },
        scopeWithNoPathSelector: {
            operation: 'getStations',
            namespaces: {
              'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
              'ns1': 'urn:dictionary:com.chargepoint.webservices'
            },
            mapping: {
              request: {
                
              },
              response: {
                id: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/stationID/text()',
                stationManufacturer: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/stationManufacturer/text()',
                stationModel: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/stationModel/text()',
                stationSerialNumber: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/stationSerialNum/text()',
                numPorts: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/numPorts/text()',
                organizationId: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/orgID/text()',
                organizationName: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/organizationName/text()',
                sgId: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/sgID/text()',
                sgName: '/soap:Envelope/soap:Body/ns1:getStationsResponse/stationData[1]/sgName/text()'
              }
            }
        }
    }
};
