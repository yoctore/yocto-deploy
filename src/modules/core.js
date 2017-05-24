'use strict';

var express           = require('express');
var logger            = require('yocto-logger');
var Q                 = require('q');
var _                 = require('lodash');
var morgan            = require('morgan');
var fsStreamRotator   = require('file-stream-rotator');
var bodyParser        = require('body-parser');

/**
 * Default core class
 */
function Core(l) {
  /**
   * default logger
   */
  this.logger =  l;

  /**
   * Default hook module to manage hook request
   */
  this.hook   = require('./hook')(this.logger);
  /**
   * internal express app for request
   */
  this.app    = express();
  /**
   * Default log path
   */
  this.logPath = process.env.NODE_DEPLOY_LOG_PATH || '/var/log';
};


/**
 * Default start method to manage setup and start action
 */
Core.prototype.start = function () {
  // create async process
  var deferred =  Q.defer();

  // log bind message
  this.logger.info('[ Agent.Core.start ] - Process Binding route for routes hook ...');

  // setup morgan log config
  this.app.use(morgan('combined', { stream : fsStreamRotator.getStream({
    date_format : 'YYYYMMDD',
    filename    : [ this.logPath, 'deploy-access-%DATE%.log' ].join('/'),
    frequency   : 'daily',
    verbose     : false
  })}));

  // for parsing application/json
  this.app.use(bodyParser.json());
  // for parsing application/x-www-form-urlencoded
  this.app.use(bodyParser.urlencoded({ extended: true }));

  // bind hook on app
  if (this.hook.bind(this.app)) {
    // define port
    var port = process.NODE_ENV || 4242;
    // listen on it
    this.app.listen(port, function () {
      // log bind message
      this.logger.info([ '[ Agent.Core.start ] - Listenning on port :', port ].join(' '));
      // log access log
      this.logger.info([ '[ Agent.Core.start ] - Access are logged into ',
                          this.logPath ].join( ''));
      // resolve
      deferred.resolve();
    }.bind(this));
  } else {
    // reject
    deferred.reject('Cannot process hook bind.')
  }

  // default statement
  return deferred.promise;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // warning message
    logger.warning('[ Agent.Core.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Core)(l);
};
