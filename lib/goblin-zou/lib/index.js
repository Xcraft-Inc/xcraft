'use strict';

const path = require('path');

class ZouUtils {
  #cache;

  constructor() {
    const xcraftConfig = require('xcraft-core-etc')().load('xcraft');
    this.#cache = path.join(xcraftConfig.tempRoot, 'zou');
  }

  getCache(url) {
    return url ? path.join(this.#cache, path.basename(url)) : this.#cache;
  }
}

module.exports = new ZouUtils();
