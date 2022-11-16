'use strict';

const fse = require('fs-extra');
const path = require('path');
const watt = require('gigawatts');
const Goblin = require('xcraft-core-goblin');

const goblinName = path.basename(module.parent.filename, '.js');

const logicState = {};
const logicHandlers = {};

const cmdProc = (cmd, xProcess) =>
  watt(
    function* (next, args, cwd, stdout) {
      yield xProcess.spawn(cmd, [...args], cwd ? {cwd} : {}, next, stdout);
    },
    {prepend: true}
  );

class Zou {
  constructor(quest) {
    this._xProcess = require('xcraft-core-process')({
      logger: 'xlog',
      parser: 'git',
      resp: quest.resp,
    });
    const xcraftConfig = require('xcraft-core-etc')(null, quest.resp).load(
      'xcraft'
    );

    this._cache = path.join(xcraftConfig.tempRoot, 'zou');
    fse.ensureDirSync(this._cache);
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
    return path.join(this._cache, path.basename(url));
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
class ZouBash extends Zou {
  constructor(quest) {
    super(quest);
    this.git = cmdProc('git', this._xProcess);
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

class ZouNet extends Zou {
  constructor(quest) {
    super(quest);
    this.zou = cmdProc('zou', this._xProcess);
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
    return out.trim();
  }

  *pull(/* cache */) {
    /* NOP */
  }

  *shar(url, sku, mode) {
    return yield this._zou('shar', url, sku, mode);
  }

  *vlast(url, sku) {
    return yield this._zou('vlast', url, sku, null);
  }

  *vtable(url, tag, next) {
    const cache = this.getCache(url);
    let out = '';
    yield this.zou(
      ['vtable', 'show', tag],
      cache,
      (line) => (out += line),
      next
    );
    return this.parseVtable(out);
  }
}

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
