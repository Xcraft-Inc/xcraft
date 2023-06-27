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

  static _cleaning(input) {
    return input
      .replace(ansiRegex(), '')
      .trim()
      .replace(/^[\n\r]+|[\n\r]+$/, '');
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
    return ZouNet._cleaning(out);
  }

  *pull(/* cache */) {
    /* NOP */
  }

  *sync(url, sku) {
    return yield this._zou('clone', url, sku, null, '-0');
  }

  *shar(url, sku, mode) {
    return yield this._zou('clone', url, sku, mode, '--show-shar', '-0');
  }

  *vlast(url, sku) {
    return yield this._zou('clone', url, sku, null, '--show-vlast', '-0');
  }

  *vtable(url, tag, next) {
    const cache = this.getCache(url);
    let out = '';
    yield this.zou(
      ['vtable', 'show', '-t:json', '-0', tag],
      cache,
      (line) => (out += line),
      next
    );
    return this.parseVtable(ZouNet._cleaning(out));
  }
}

module.exports = ZouNet;
