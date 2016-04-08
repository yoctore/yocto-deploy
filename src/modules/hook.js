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
    'X-Gitlab-Event',
    'X-GitHub-Event',
    'X-Y8-Event'
  ];
};

Hook.prototype.isValidHeaders = function (headers) {
  console.log(headers);
  console.log(Object.keys(headers));
  // default statement
  return _.includes(Object.keys(headers), this.allowedHeaders);
};

Hook.prototype.hookGithub = function (req, res) {
  console.log(req.body);
};

Hook.prototype.hookGitlab = function (req, res) {
  // log message
  this.logger.info('[ Agent.Core.Hook.Gitlab ] - Processing deploy hooks')

  console.log(req.body);  
};

Hook.prototype.hook = function () {
  // build correct fn callbac function
  //var n = utils.str.camelCase([ 'hook_', h.name ].join(''));
};

/**
 * Bind all hooks from givent web app
 *
 * @param {Object} app express app for routes management
 */
Hook.prototype.bind = function (app) {
  // bind default route
  app.get('/deploy', function (req, res) {
    // has valid headers
    if (this.isValidHeaders(req.headers)) {
      // process hook
      this.hook(req.headers);
    } else {
      // cannot process log error
      this.logger.error([ '[ Agent.Core.Hook ] - received hook is forbidden.',
                          ' User agent is not allowed. IP [', req.ip, '] Headers [',
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
