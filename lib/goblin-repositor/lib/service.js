'use strict';

const path = require('path');
const fse = require('fs-extra');
const Goblin = require('xcraft-core-goblin');
const xConfig = require('xcraft-core-etc')().load('xcraft');

const goblinName = path.basename(module.parent.filename, '.js');

const logicState = {};
const logicHandlers = {};

let osRelease;

function getOsRelease(key) {
  if (!osRelease) {
    osRelease = fse
      .readFileSync('/etc/os-release')
      .toString()
      .split('\n')
      .reduce((state, row) => {
        const [key, value] = row.split('=', 2);
        state[key] = value;
        return state;
      }, {});
  }
  return osRelease[key];
}

Goblin.registerQuest(goblinName, 'initialize', function* (
  quest,
  distribution,
  $suite = 'stable',
  next
) {
  const xProcess = require('xcraft-core-process')({
    logger: 'xlog',
    resp: quest.resp,
  });

  const prodRoot = `prodroot.${distribution}`;
  const repoDir = path.join(xConfig.xcraftRoot, 'var', prodRoot, 'var/deb');

  if (fse.existsSync(repoDir)) {
    quest.log.info(`the repository ${distribution} already exists`);
    return true;
  }

  const architectures = {
    arm: 'armhf',
    arm64: 'arm64',
    ia32: 'i386',
    mips: 'mips',
    mipsel: 'mipsel',
    ppc: 'PowerPC',
    ppc64: 'ppc64el',
    s390: 's390',
    s390x: 's390x',
    x32: 'x32',
    x64: 'amd64',
  };

  const arch = architectures[process.arch];
  const distributionFile = `
Suite: ${$suite}
Codename: ${getOsRelease('VERSION_CODENAME')}
Components: non-free
Architectures: ${arch}
SignWith: yes
`;

  fse.ensureDirSync(path.join(repoDir, 'conf'));
  fse.writeFileSync(path.join(repoDir, 'conf/distributions'), distributionFile);

  try {
    yield xProcess.spawn('reprepro', ['-b', repoDir, 'export'], {}, next);
  } catch (ex) {
    fse.removeSync(repoDir);
    throw ex;
  }
});

Goblin.registerQuest(goblinName, 'publish', function* (
  quest,
  distribution,
  packageDeb,
  next
) {
  const xProcess = require('xcraft-core-process')({
    logger: 'xlog',
    resp: quest.resp,
  });

  const prodRoot = `prodroot.${distribution}`;
  const repoDir = path.join(xConfig.xcraftRoot, 'var', prodRoot, 'var/deb');

  yield xProcess.spawn(
    'reprepro',
    [
      '-vb',
      repoDir,
      'includedeb',
      getOsRelease('VERSION_CODENAME'),
      packageDeb,
    ],
    {},
    next
  );
});

// Singleton
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
Goblin.createSingle(goblinName);
