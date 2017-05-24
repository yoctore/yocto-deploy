'use strict';

var logger  = require('yocto-logger');
var _       = require('lodash');
var utils   = require('yocto-utils');

/**
 * Default hook class to manage hook action
 */
function Hook(l) {
  /**
   * Default logger
   */
  this.logger = l;

  /**
   * List of allowed header
   */
  this.allowedHeaders = [
    { header : 'X-Gitlab-Event', host : 'gitlab', enable : true },
    { header : 'X-GitHub-Event', host : 'github', enable : false }
  ];

  // We need to normalize headers to lowercase in some case of usage
  _.each(this.allowedHeaders, function (a) {
    // add item to lowercase
    this.allowedHeaders.push({
      header  : a.header.toLowerCase(),
      host    : a.host,
      enable  : a.enable
    });
  }.bind(this));
  /**
   * Current queue storage
   */
  //this.queue = require('./queue');
};

Hook.prototype.isValidHeaders = function (headers) {
  // default statement
  return _.includes(Object.keys(headers),
         _.first(_.intersection(Object.keys(headers), _.map(this.allowedHeaders, function (h) {
            return h.header;
        }))));
};

Hook.prototype.fetch = function (body, headers) {
  // get correct config
  var founded = this.findCorrectHeadersConfig(headers);

  // log message
  this.logger.info([ '[ Agent.Core.Fetch ] - Receiving hook request from',
                     founded.host || 'unkown' ].join(' '));

  console.log(body);
  // TODO : set a joi schema
  if (_.has(body, 'object_kind') && _.has(body, 'ref')) {
    // log type of storage
    this.logger.info([ '[ Agent.Core.Fetch ] - Store a [',
                       _.get(body, 'object_kind').toLowerCase(),
                       '] request with ref [', _.get(body, 'ref'), ']' ].join(' '));
                       // TODO add repo url
    // Save file here
    
  } else {
    // log error cannot store with missing data
    this.logger.error([ '[ Agent.Core.Fetch ] - Cannot store this request in queue.',
                        'Received body is invalid.',
                        'Cannot found type and/or ref of hook' ].join(' '));
  }
};

/**
 * Get current config from givent header
 *
 * @param {String} headers default header to use to check if the defined system is enabled
 * @return {Object} default object config
 */
Hook.prototype.findCorrectHeadersConfig = function (headers) {
  // get correct config
  return _.find(this.allowedHeaders, 'header',
                  _.first(_.intersection(Object.keys(headers),
                    _.map(this.allowedHeaders, function (h) {
                        return h.header;
                    }))));
};

/**
 * Default method to check if current host is authorized or not
 *
 * @param {String} headers default header to use to check if the defined system is enabled
 * @return {Boolean} true if is allowed false otherwise
 */
Hook.prototype.isEnabled = function (headers) {
  // get correct config
  var founded = this.findCorrectHeadersConfig(headers);
  // default statement
  return _.isObject(founded) && _.has(founded, 'enable') && founded.enable;
};

/**
 * Default method to hook data and return correct status
 *
 * @param {Object} current request to process correct process
 * @return {Interger} default status value
 */
Hook.prototype.hook = function (body, headers) {
  // is a valid function
  if (this.isValidHeaders(headers)) {
    // is enabled ?
    if (this.isEnabled(headers)) {
      // process
      this.fetch(body, headers);
    } else {
      // log error message
      this.logger.error([ '[ Agent.Core.Hook ] - Hook is not implemented for given headers :',
                          utils.obj.inspect(headers) ].join(' '));
      // return 501 error because not implemented
      return 501;
    }
  } else {
    // log error message
    this.logger.error([ '[ Agent.Core.Hook ] - Cannot valid given headers :',
                        utils.obj.inspect(headers) ].join(' '));
    // return 501 error because not implemented
    return 501;
  }
  // default statement
  return 404;
};

/**
 * Bind all hooks from givent web app
 *
 * @param {Object} app express app for routes management
 */
Hook.prototype.bind = function (app) {
  // bind default route
  app.post('/deploy', function (req, res) {
    // has valid headers
    if (this.isValidHeaders(req.headers)) {
      // process hook
      res.sendStatus(this.hook(req.body, req.headers));
    } else {
      // cannot process log error
      this.logger.error([ '[ Agent.Core.Hook ] - received hook is forbidden.',
                          'User agent is not allowed.' ].join(' '));
      this.logger.error([ '[ Agent.Core.Hook ] - From ip address [', req.ip, '] with headers [',
                          utils.obj.inspect(req.headers), ']' ].join(' '));
      // forbidden response
      res.sendStatus(403);
    }
  }.bind(this));
  // default statement
  return true;
};

// Default export
module.exports = function (l) {
  // is a valid logger ?
  if (_.isUndefined(l) || _.isNull(l)) {
    // warning message
    logger.warning('[ Agent.Core.Hook.constructor ] - Invalid logger given. Use internal logger');
    // assign
    l = logger;
  }

  // default statement
  return new (Hook)(l);
};
