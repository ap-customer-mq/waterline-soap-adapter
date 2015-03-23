var fs = require('fs')
    path = require('path');

function loadSoapMessage(faultResponse) {
  return fs.readFileSync(path.join(__dirname, 'soap', faultResponse + ".xml")).toString();
}

module.exports = {
  getStationsResponse: loadSoapMessage('getStationsResponse'),
  getStationsByStationModelResponse: loadSoapMessage('getStationsByStationModelResponse'),
  getStationsByStationIdResponse: loadSoapMessage('getStationsByStationIdResponse'),
  exampleSoapFault: loadSoapMessage('exampleSoapFault')
};
