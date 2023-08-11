'use strict';

const path = require('path');
const watt = require('gigawatts');
const fse = require('fs-extra');

class Zou {
  constructor(quest) {
    this._zouUtils = require('./index.js');
    this._xProcess = require('xcraft-core-process')({
      logger: 'xlog',
      parser: 'git',
      resp: quest.resp,
    });
    fse.ensureDirSync(this._zouUtils.getCache());
  }

  static cmdProc(cmd, xProcess) {
    return watt(
      function* (next, args, cwd, stdout) {
        const env = {...process.env, NO_COLOR: 1};
        const opts = {env};
        if (cwd) {
          opts.cwd = cwd;
        }
        yield xProcess.spawn(cmd, [...args], opts, next, stdout);
      },
      {prepend: true}
    );
  }

  _parseVtableMarkdown(vtable) {
    return vtable
      .split('\n')
      .map((row) =>
        row
          .split('|')
          .filter((field) => !!field.trim())
          .map((field) => field.trim())
      )
      .reduce((vtable, row) => {
        vtable[row[0]] = {
          Module: row[0],
          Version: row[1],
          Hash: row[2],
          Dev: row[3],
          Prod: row[4],
        };
        return vtable;
      }, {});
  }

  _parseVtableJSON(vtable) {
    return JSON.parse(vtable).reduce((vtable, row) => {
      vtable[row.Module] = row;
      return vtable;
    }, {});
  }

  getCache(url) {
    return this._zouUtils.getCache(url);
  }

  parseVtable(vtable) {
    vtable = vtable.trim();
    if (vtable.startsWith('|')) {
      return this._parseVtableMarkdown(vtable);
    }
    if (vtable.startsWith('[')) {
      return this._parseVtableJSON(vtable);
    }
    throw new Error('unsupported vtable format');
  }
}

module.exports = Zou;
