'use strict';

var moduleName = 'gilabci-build';

var path         = require ('path');
var util         = require ('util');
var EventEmitter = require ('events').EventEmitter;

var client = require ('./client.js') ();
var xLog   = require ('xcraft-core-log') (moduleName);


function Build (opts, runnerConfig) {
  if (!(this instanceof Build)) {
    return new Build (opts, runnerConfig);
  }

  EventEmitter.call (this);
  this.config   = runnerConfig;
  this.buildDir = this.config.root;
  opts.commands = opts.commands || [];
  opts.timeout  = +(this.config.timeout || opts.timeout || 5000) * 1000;
  this.opts     = opts;
  this.output   = '';
  this.projectDir = path.join (this.buildDir, 'project-' + opts.projectId);
  this.state = 'waiting';
}

util.inherits (Build, EventEmitter);

Build.prototype.run = function () {
  var self = this;

  this.state = 'running';

  var cmds = this.opts.commands;
  var dir  = this.projectDir;

  self.runCommand (cmds, dir, function (err) {
    self.state = err ? 'failed' : 'success';
    self.update (function () {
      self.emit ('done', !!err);
    });
  });
};

Build.prototype.append = function (str) {
  this.output += str;
};

Build.prototype.runCommand = function (cmd, dir, callback) {
  var self = this;

  var packages    = cmd[0] || '';
  var mainPackage = packages.split (',')[0].replace (/:.*/, '');

  /* TODO: add timeout support. */

  var xBusClient = require ('xcraft-core-busclient');
  var xcraftPortal = new xBusClient.BusClient (self.config.xcraft);

  /* XXX: handle useful logs (command outputs too).
   * Using catchAll is a bad idea because many events are useless here.
   */
  xcraftPortal.events.catchAll (function (topic, msg) {
    self.append (JSON.stringify (msg) + '\n');
  });

  xcraftPortal.connect (null, function () {
    xLog.info ('runner connected with ' + xcraftPortal.getOrcName ());

    var args = {
      packageArgs: [
        packages,
        'p:' + mainPackage + ':data.get.ref=' + self.opts.sha
      ]
    };

    /* TODO: build the source package after 'make'. */
    xcraftPortal.command.send ('pacman.make', args, function () {
      xcraftPortal.command.send ('disconnect', null, function () {
        xcraftPortal.stop (function () {
          xcraftPortal = null;
          self.update (callback);
        });
      });
    });
  });
};

Build.prototype.update = function (callback) {
  var id = this.opts.id;
  client.updateBuild (this.config, id, this.state, this.output, callback);
};

module.exports = Build;
