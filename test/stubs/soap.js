var fs = require('fs')
    path = require('path');

module.exports = {
  getStationsResponse: fs.readFileSync(path.join(__dirname, 'soap', 'getStationsResponse.xml')).toString(),
  getStationsByStationModelResponse: fs.readFileSync(path.join(__dirname, 'soap', 'getStationsByStationModelResponse.xml')).toString()
};



