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

  var xBusClient = require ('xcraft-core-busclient');
  var xcraftPortal = new xBusClient.BusClient (self.config.xcraft);

  xcraftPortal.connect (null, function () {
    xLog.info ('runner connected with ' + xcraftPortal.getOrcName ());

    /* TODO: send commands to Xcraft host */
    self.append ('not implemented...\n');

    // xcraftPortal.command.send ('pacman.list', null, function () {
      xcraftPortal.stop (function () {
        xcraftPortal = null;
        self.update (callback);
      });
    // });
  });

  //TODO: Cross Platform
  //TODO: Fix env
  /*
  var child = spawn ('/bin/bash', ['-c', fixedCmd.join (' ')], opts);
  var timedout = false;
  var timer = setTimeout (function () {
    timedout = true;
    child.kill ();
    self.append ('\n** TIMEOUT **\n');
  }, this.opts.timeout);
  child.stderr.on ('data', function (d) {
    var data = d.toString ();
    xLog.err ('stderr', data);
    self.append (data);
  });
  child.stdout.on ('data', function (d) {
    var data = d.toString ();
    xLog.verb ('stdout', data);
    self.append (data);
  });
  child.on ('close', function (code) {
    if (timer) {
      clearTimeout (timer);
      timer = null;
    }
    if (code !== 0) {
      var msg = timedout ? 'process timedout' : 'process exited with code: ' + code;
      var e = new Error (msg);
      self.append (util.format (
        'Command: [%s] exited with code: %d timedout: %s', cmd, code,
        timedout ? 'yes' : 'no'
      ));
      e.command = cmd;
      e.opts = opts;
      self.state = 'failed';
      self.update (function () {
        cb && cb (e);
      });
      return;
    }
    self.update (function () {
      cb && cb ();
    });
  });
  */
};

Build.prototype.update = function (callback) {
  var id = this.opts.id;
  client.updateBuild (this.config, id, this.state, this.output, callback);
};

module.exports = Build;
