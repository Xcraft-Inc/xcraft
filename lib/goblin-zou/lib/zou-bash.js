'use strict';

const watt = require('gigawatts');
const fse = require('fs-extra');
const Zou = require('./zou.js');

class ZouBash extends Zou {
  constructor(quest) {
    super(quest);
    this.git = Zou.cmdProc('git', this._xProcess);
    watt.wrapAll(this);
  }

  *_git(cmd, url, sku, mode, ...args) {
    const next = args.pop();
    const cache = this.getCache(url);
    const _args = [cmd, '-v', `--wrk=${cache}`, `--url=${url}`, `--sku=${sku}`];
    if (mode) {
      _args.push(`--${mode}`);
    }
    if (args.length) {
      _args.push(...args);
    }
    let out = '';
    yield this.git(_args, null, (line) => (out += line), next);
    return out.trim();
  }

  *cleanex(url) {
    const cache = this.getCache(url);
    if (!fse.existsSync(cache)) {
      return;
    }
    yield this.git(['cleanex', '-a', '-r', '-f'], cache);
  }

  *pull(cache) {
    yield this.git(['pull'], cache);
  }

  *shar(url, sku, mode) {
    return yield this._git('shar', url, sku, mode, '-a=256');
  }

  *vlast(url, sku) {
    return yield this._git('vlast', url, sku, null);
  }

  *vtable(url, tag, next) {
    const cache = this.getCache(url);
    let out = '';
    yield this.git(['vtable', tag], cache, (line) => (out += line), next);
    return this.parseVtable(out);
  }
}

module.exports = ZouBash;
