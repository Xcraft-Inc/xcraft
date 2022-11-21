'use static';

const moduleName = 'deb-http';

const path = require('path');
const express = require('express');
const chokidar = require('chokidar');
const watt = require('gigawatts');

const xPlatform = require('xcraft-core-platform');

class DebHttp {
  constructor(port = 80, hostname = '127.0.0.1') {
    const xConfig = require('xcraft-core-etc')().load('xcraft');

    this._xLog = require('xcraft-core-log')(moduleName, null);
    this._app = express();
    this._port = port;
    this._hostname = hostname;
    this._varRoot = path.join(xConfig.xcraftRoot, 'var');
    this._repositories = [];
    this._registered = {};

    this._watcher = chokidar
      .watch(path.join(this._varRoot, `*root*`), {depth: 1})
      .on('addDir', (dir) => this._refreshRoute(dir));

    watt.wrapAll(this);
  }

  _refreshRoute(dir) {
    const dirs = dir.split(path.sep);
    const lastDir = dirs[dirs.length - 1];
    const distribution =
      lastDir === 'devroot' ? 'toolchain' : lastDir.split('.')[1];
    const route = `/${distribution}`;

    if (!this._registered[route]) {
      const arch = xPlatform.getToolchainArch();
      this._addRoute(path.join(dir, arch, 'var/deb'), route);
    }
  }

  _addRoute(dirPath, webRoute) {
    this._xLog.verb(
      `add ${this._hostname}:${this._port}${webRoute} for ${dirPath}`
    );
    this._app.use(webRoute, express.static(dirPath));
    this._registered[webRoute] = true;
  }

  serve() {
    this._server = this._app.listen(this._port, this._hostname);
  }

  *dispose(next) {
    if (this._server) {
      this._server.close(next.parallel());
    }
    this._watcher.close(next.parallel());
    yield next.sync();
  }
}

module.exports = DebHttp;
