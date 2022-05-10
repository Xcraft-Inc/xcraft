'use strict';

const fse = require('fs-extra');
const path = require('path');
const watt = require('gigawatts');
const Goblin = require('xcraft-core-goblin');

const goblinName = path.basename(module.parent.filename, '.js');

const logicState = {};
const logicHandlers = {};

const gitProc = (xProcess) =>
  watt(
    function* (next, args, cwd, stdout) {
      yield xProcess.spawn('git', [...args], cwd ? {cwd} : {}, next, stdout);
    },
    {prepend: true}
  );
class Zou {
  constructor(quest) {
    const xProcess = require('xcraft-core-process')({
      logger: 'xlog',
      parser: 'git',
      resp: quest.resp,
    });
    const xcraftConfig = require('xcraft-core-etc')(null, quest.resp).load(
      'xcraft'
    );

    this._cache = path.join(xcraftConfig.tempRoot, 'zou');
    fse.ensureDirSync(this._cache);

    this.git = gitProc(xProcess);

    watt.wrapAll(this);
  }

  *_git(cmd, url, sku, mode, ...args) {
    const next = args.pop();
    const cache = path.join(this._cache, path.basename(url));
    const _args = [cmd, `--wrk=${cache}`, `--url=${url}`, `--sku=${sku}`];
    if (mode) {
      _args.push(`--${mode}`);
    }
    if (args.length) {
      _args.push(...args);
    }
    let out = '';
    yield this.git(_args, null, (line) => (out += line), next);
    return out;
  }

  *shar(url, sku, mode) {
    return yield this._git('shar', url, sku, mode, '-a=256');
  }

  *vlast(url, sku) {
    return yield this._git('vlast', url, sku, 'vlast');
  }
}

Goblin.registerQuest(goblinName, 'shar', function* (quest, url, sku, mode) {
  const zou = new Zou(quest);
  return yield zou.shar(url, sku, mode);
});

Goblin.registerQuest(goblinName, 'vlast', function* (quest, url, sku) {
  const zou = new Zou(quest);
  return yield zou.vlast(url, sku);
});

// Singleton
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
Goblin.createSingle(goblinName);
