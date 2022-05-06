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

  *shar(url, sku, mode) {
    const cache = path.join(this._cache, path.basename(url));
    yield this.git([
      'shar',
      '-a=256',
      `--url=${url}`,
      `--sku=${sku}`,
      `--${mode}`,
      cache,
    ]);
  }
}

Goblin.registerQuest(goblinName, 'computeShar', function* (
  quest,
  url,
  sku,
  mode
) {
  const zou = new Zou(quest);
  yield zou.shar(url, sku, mode);
});

// Singleton
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
Goblin.createSingle(goblinName);
