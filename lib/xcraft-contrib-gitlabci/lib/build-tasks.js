'use strict';


function Tasks (busClient, mainPackage, packages, ref) {
  this._busClient   = busClient;
  this._mainPackage = mainPackage;
  this._packages    = packages;
  this._ref         = ref;
}

Tasks.prototype.make = function (callback) {
  this._busClient.command.send ('pacman.make', {
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

  self._busClient.events.subscribe ('pacman.status', function (msg) {
    self._busClient.events.unsubscribe ('pacman.status');
    isInstalled = msg.data.installed;
  });

  self._busClient.command.send ('pacman.status', {
    packageRefs: self._mainPackage + '-src'
  }, function () {
    callback (null, isInstalled);
  });
};

Tasks.prototype.remove = function (callback, results) {
  if (!results.isInstalled) {
    callback ();
    return;
  }

  this._busClient.command.send ('pacman.remove', {
    packageRefs: this._mainPackage + '-src'
  }, function () {
    callback ();
  });
};

Tasks.prototype.build = function (callback, results) {
  if (results.make !== this._busClient.events.status.succeeded) {
    callback ();
    return;
  }

  this._busClient.command.send ('pacman.build', {
    packageRefs: this._mainPackage
  }, function (err, msg) {
    callback (null, msg.data);
  });
};

Tasks.prototype.disconnect = function (callback) {
  this._busClient.command.send ('disconnect', null, function () {
    callback ();
  });
};

Tasks.prototype.stop = function (callback) {
  this._busClient.stop (callback);
};

module.exports = Tasks;
