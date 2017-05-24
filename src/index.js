'use strict';

var os      = require('os');
var logger  = require('yocto-logger');
var agent   = require('./modules/core')(logger);

/**
 * Default export module
 */
module.exports = function () {
  // Default statement
  return {
    /**
     * Start agent
     */
    start : function() {
        // start agent
      agent.start().then(function () {
        // log start
        agent.logger.info([ '[ Agent ] - Starting on [',
                            os.type().toLowerCase() === 'darwin' ? 'OS X' : os.type(),
                            '-', os.platform(), '-', os.release(), ']' ].join(' '));
      }).catch(function (error) {
        // log error
        agent.logger.error([ 'Cannot start app :', error ].join(' '));
        // exit
        process.exit(0);
      });
    }
  }
}