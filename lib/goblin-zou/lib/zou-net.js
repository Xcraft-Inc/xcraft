'use strict';

const watt = require('gigawatts');
const Zou = require('./zou.js');
const ansiRegex = require('ansi-regex');

class ZouNet extends Zou {
  constructor(quest) {
    super(quest);
    this.zou = Zou.cmdProc('zou', this._xProcess);
    watt.wrapAll(this);
  }

  *_zou(cmd, url, sku, mode, ...args) {
    const next = args.pop();
    const cache = this.getCache(url);
    const _args = [cmd, cache, `--url=${url}`, `--sku=${sku}`];
    if (mode) {
      _args.push(`--${mode}`);
    }
    if (args.length) {
      _args.push(...args);
    }
    let out = '';
    yield this.zou(_args, null, (line) => (out += line), next);
    return out
      .replace(ansiRegex(), '')
      .trim()
      .replace(/^[\n\r]+|[\n\r]+$/, '')
      .replace(/[\n\r]+$/, '');
  }

  *pull(/* cache */) {
    /* NOP */
  }

  *shar(url, sku, mode) {
    return yield this._zou('clone', url, sku, mode, '--show-shar');
  }

  *vlast(url, sku) {
    return yield this._zou('clone', url, sku, null, '--show-vlast');
  }

  *vtable(url, tag, next) {
    const cache = this.getCache(url);
    let out = '';
    yield this.zou(
      ['vtable', 'format', '-t:json', tag],
      cache,
      (line) => (out += line),
      next
    );
    return this.parseVtable(out);
  }
}

module.exports = ZouNet;
