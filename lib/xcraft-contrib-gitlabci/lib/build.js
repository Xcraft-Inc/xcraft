'use strict';

var client   = require ('./client.js') ();
var path     = require ('path');
var util     = require ('util');
var argsplit = require ('argsplit');
var EE       = require ('events').EventEmitter;
var xLog     = require ('xcraft-core-log') ('gitlabci-build-process');


function Build (opts, runnerConfig) {
  if (!(this instanceof Build)) {
    return new Build (opts, runnerConfig);
  }

  EE.call (this);
  this.config   = runnerConfig;
  this.buildDir = this.config.root;
  opts.commands = opts.commands || [];
  opts.timeout  = +(this.config.timeout || opts.timeout || 5000) * 1000;
  this.opts     = opts;
  this.output   = '';
  this.projectDir = path.join (this.buildDir, 'project-' + opts.projectId);
  this.state = 'waiting';
}

util.inherits (Build, EE);

Build.prototype.run = function () {
  var self = this;

  this.state = 'running';

  var cmds = this.opts.commands;
  var len  = cmds.length;
  var dir  = this.projectDir;

  function runCommand (idx) {
    if (idx < len) {
      xLog.verb ('running command', idx + 1, 'of', len);
      var cmd = cmds[idx];
      self.runCommand (cmd, dir, function (err) {
        if (err) {
          return self.emit ('done', false);
        }
        runCommand (idx + 1);
      });
    } else {
      self.state = 'success';
      self.update (function () {
        self.emit ('done', true);
      });
    }
  }

  runCommand (0);
};

Build.prototype.append = function (str) {
  this.output += str;
};

Build.prototype.runCommand = function (cmd, dir, callback) {
  var self = this;

  if (typeof dir === 'function') {
    callback = dir;
    dir = process.cwd ();
  }

  var opts = {
    env: process.env,
    cwd: dir,
    timeout: this.opts.timeout
  };

  var fixedCmd = cmd;
  if (!Array.isArray (cmd)) {
    fixedCmd = argsplit (cmd);
  }

  xLog.verb ('cmd', cmd);
  this.append (util.format ('\n%s\n', cmd));
  this.append ('not implemented...');
  self.update (function () {
    if (callback) {
      callback ();
    }
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
