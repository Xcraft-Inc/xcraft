'use strict';


function Tasks (resp, mainPackage, packages, ref) {
  this._resp        = resp;
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

  this._resp.command.send ('pacman.make', {
    packageArgs: [
      this._packages,
      'p:' + this._mainPackage + ':data.get.ref=' + this._ref
    ]
  }, function (err, msg) {
    callback (null, msg.data);
  });
};

Tasks.prototype.isInstalled = function (callback) {
  const self = this;
  let isInstalled = false;

  if (self._abort) {
    callback ();
    return;
  }

  self._resp.events.subscribe ('pacman.status', function (msg) {
    self._resp.events.unsubscribe ('pacman.status');
    isInstalled = msg.data.installed;
  });

  self._resp.command.send ('pacman.status', {
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

  this._resp.command.send ('pacman.remove', {
    packageRefs: this._mainPackage + '-src'
  }, function () {
    callback ();
  });
};

Tasks.prototype.build = function (callback, results) {
  if (results.make !== this._resp.events.status.succeeded || this._abort) {
    callback ();
    return;
  }

  this._resp.command.send ('pacman.build', {
    packageRefs: this._mainPackage
  }, function (err, msg) {
    callback (null, msg.data);
  });
};

Tasks.prototype.disconnect = function (callback) {
  this._resp.command.send ('disconnect', null, function () {
    callback ();
  });
};

module.exports = Tasks;
