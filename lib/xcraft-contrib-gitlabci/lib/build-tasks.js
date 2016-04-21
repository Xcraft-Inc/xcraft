'use strict';


function Tasks (response, mainPackage, packages, ref) {
  this._response    = response;
  this._mainPackage = mainPackage;
  this._packages    = packages;
  this._ref         = ref;
  this._abort       = false;
  this._abortError  = '';
}

Tasks.prototype.setAbort = function (abort, error) {
  this._abort      = abort;
  this._abortError = error;
};

Tasks.prototype.getAbort = function () {
  return this._abort;
};

Tasks.prototype.getAbortError = function () {
  return this._abortError;
};

Tasks.prototype.make = function (callback) {
  if (this._abort) {
    callback ();
    return;
  }

  this.response.command.send ('pacman.make', {
    packageArgs: [
      this._packages,
      'p:' + this._mainPackage + ':data.get.ref=' + this._ref
    ]
  }, function (err, msg) {
    callback (null, msg.data);
  });
};

Tasks.prototype.isInstalled = function (callback) {
  var self = this;
  var isInstalled = false;

  if (self._abort) {
    callback ();
    return;
  }

  self.response.events.subscribe ('pacman.status', function (msg) {
    self.response.events.unsubscribe ('pacman.status');
    isInstalled = msg.data.installed;
  });

  self.response.command.send ('pacman.status', {
    packageRefs: self._mainPackage + '-src'
  }, function () {
    callback (null, isInstalled);
  });
};

Tasks.prototype.remove = function (callback, results) {
  if (!results.isInstalled || this._abort) {
    callback ();
    return;
  }

  this.response.command.send ('pacman.remove', {
    packageRefs: this._mainPackage + '-src'
  }, function () {
    callback ();
  });
};

Tasks.prototype.build = function (callback, results) {
  if (results.make !== this.response.events.status.succeeded || this._abort) {
    callback ();
    return;
  }

  this.response.command.send ('pacman.build', {
    packageRefs: this._mainPackage
  }, function (err, msg) {
    callback (null, msg.data);
  });
};

Tasks.prototype.disconnect = function (callback) {
  this.response.command.send ('disconnect', null, function () {
    callback ();
  });
};

Tasks.prototype.stop = function (callback) {
  this.response.stop (callback);
};

module.exports = Tasks;
