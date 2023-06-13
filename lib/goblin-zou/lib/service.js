'use strict';

const path = require('path');
const Goblin = require('xcraft-core-goblin');
const ZouBash = require('./zou-bash.js');
const ZouNet = require('./zou-net.js');

const goblinName = path.basename(module.parent.filename, '.js');

const logicState = {};
const logicHandlers = {};

Goblin.registerQuest(goblinName, 'cleanex_bash', function* (quest, url) {
  const zou = new ZouBash(quest);
  return yield zou.cleanex(url);
});

Goblin.registerQuest(goblinName, 'shar_bash', function* (
  quest,
  url,
  sku,
  mode
) {
  const zou = new ZouBash(quest);
  return yield zou.shar(url, sku, mode);
});

Goblin.registerQuest(goblinName, 'vlast_bash', function* (quest, url, sku) {
  const fse = require('fs-extra');
  const zou = new ZouBash(quest);
  if (fse.existsSync(zou.getCache(url))) {
    yield zou.pull(zou.getCache(url));
  }
  return yield zou.vlast(url, sku);
});

Goblin.registerQuest(goblinName, 'vtable_bash', function* (quest, url, tag) {
  const zou = new ZouBash(quest);
  return yield zou.vtable(url, tag);
});

Goblin.registerQuest(goblinName, 'sync', function* (quest, url, sku, mode) {
  const zou = new ZouNet(quest);
  return yield zou.sync(url, sku);
});

Goblin.registerQuest(goblinName, 'shar', function* (quest, url, sku, mode) {
  const zou = new ZouNet(quest);
  return yield zou.shar(url, sku, mode);
});

Goblin.registerQuest(goblinName, 'vlast', function* (quest, url, sku) {
  const zou = new ZouNet(quest);
  return yield zou.vlast(url, sku);
});

Goblin.registerQuest(goblinName, 'vtable', function* (quest, url, tag) {
  const zou = new ZouNet(quest);
  return yield zou.vtable(url, tag);
});

// Singleton
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
Goblin.createSingle(goblinName);
