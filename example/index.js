'use strict';

var logger  = require('yocto-logger');
var core    = require('../src/')(logger);

core.start().then(function () {
  
}).catch(function (error) {
  core.logger.error([ 'Cannot start app :', error ].join(' '));
});