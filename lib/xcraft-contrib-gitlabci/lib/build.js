'use strict';

var moduleName = 'gitlabci/build';

var clc          = require ('cli-color');
var path         = require ('path');
var util         = require ('util');
var EventEmitter = require ('events').EventEmitter;

var client = require ('./client.js') ();
var xLog   = require ('xcraft-core-log') (moduleName);

var colors = {
  verb: clc.cyanBright.bold,
  info: clc.greenBright.bold,
  warn: clc.yellowBright.bold,
  err:  clc.redBright.bold
};


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
  this.dirty    = false;
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
  this.dirty = true;
};

Build.prototype.runCommand = function (cmd, dir, callback) {
  var self = this;

  var timer = setInterval (function () {
    if (!self.dirty) {
      return;
    }

    self.update (function (err, res) {
      if (!err && res) {
        self.dirty = false;
      }
    });
  }, self.config.updateInterval);

  var packages    = cmd[0] || '';
  var mainPackage = packages.split (',')[0].replace (/:.*/, '');

  /* TODO: add timeout support. */

  var xBusClient = require ('xcraft-core-busclient');
  var xcraftPortal = new xBusClient.BusClient (self.config.xcraft);

  xcraftPortal.connect (null, function () {
    ['verb', 'info', 'warn', 'err'].forEach (function (level) {
      xcraftPortal.events.subscribe ('widget.text.' + level, function (msg) {
        if (/^gitlabci(|\/.*)$/.test (msg.data.mod)) {
          return;
        }

        var text = util.format ('[%s] %s: %s',
                                clc.whiteBright.bold (msg.data.mod),
                                colors[level] (level),
                                msg.data.text);
        self.append (text + '\n');
      });
    });

    xcraftPortal.events.subscribe ('widget.progress', function (msg) {
      var ratio   = msg.data.position / msg.data.length;
      var percent = parseInt (100 * ratio);
      if ((percent % 2) !== 0) {
        return;
      }

      var text = util.format ('[%s] %s: %s |%s> %d\%',
                              clc.whiteBright.bold (msg.data.mod),
                              colors.info ('info'),
                              msg.data.topic,
                              new Array (percent / 2).join ('='),
                              percent);
      self.append (text + '\n');
    });

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
          clearInterval (timer);
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
