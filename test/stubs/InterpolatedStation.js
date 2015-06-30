'use strict';

var Station = require('./Station'),
    _       = require('lodash');

// Clone Station stub but change the connection

Station = _.cloneDeep(Station);

Station.connection = 'testInterpolation';

module.exports = Station;
