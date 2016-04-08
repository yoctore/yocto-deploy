'use strict';

var express = require('express');
var logger  = require('yocto-logger');
var Q       = require('q');
var _       = require('lodash');

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
};

/**
 * Default start method to manage setup and start action
 */
Core.prototype.start = function () {
  // create async process
  var deferred =  Q.defer();

  // log bind message
  this.logger.info('[ Agent.Core.start ] - Process Binding route for routes hook ...');
  // bind hook on app
  if (this.hook.bind(this.app)) {
    // define port
    var port = process.NODE_ENV || 4242;
    // listen on it
    this.app.listen(port, function () {
      // log bind message
      this.logger.info([ '[ Agent.Core.start ] - Listenning on port :', port ].join(' '));
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
