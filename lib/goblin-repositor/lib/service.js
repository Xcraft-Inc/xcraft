'use strict';

const path = require('path');
const watt = require('gigawatts');
const fse = require('fs-extra');
const Goblin = require('xcraft-core-goblin');
const xPlatform = require('xcraft-core-platform');
const xPacman = require('xcraft-contrib-pacman');
const xEnv = require('xcraft-core-env');
const xFs = require('xcraft-core-fs');

const goblinName = path.basename(module.parent.filename, '.js');

const logicState = {};
const logicHandlers = {};

let osRelease;

function getOsRelease(key) {
  if (!osRelease) {
    const repositorConfig = require('xcraft-core-etc')().load(
      'goblin-repositor'
    );
    osRelease = fse
      .readFileSync('/etc/os-release')
      .toString()
      .split('\n')
      .reduce((state, row) => {
        const [key, value] = row.split('=', 2);
        state[key] = value;
        return state;
      }, {});
    if (repositorConfig.osRelease) {
      osRelease.VERSION_CODENAME = repositorConfig.osRelease;
    }
  }
  return osRelease[key];
}

Goblin.registerQuest(goblinName, '_generateKey', function* (
  quest,
  distribution,
  repoDir,
  next
) {
  const xProcess = require('xcraft-core-process')({
    logger: 'xlog',
    resp: quest.resp,
  });

  if (!process.env.GNUPGHOME) {
    throw new Error('The GNUPGHOME environment variable is missing');
  }

  const email = `${distribution}@localhost`;
  fse.ensureDirSync(process.env.GNUPGHOME, {mode: 0o0700});

  const readKey = watt(function* (next) {
    const output = [];
    yield xProcess.spawn(
      'gpg',
      ['--no-tty', '-K'],
      {cwd: process.env.GNUPGHOME},
      next,
      (row) => {
        row = row.trim();
        if (row) {
          output.push(row);
        }
      }
    );
    const keyIdx = output.findIndex((value) => value.includes(email));
    return keyIdx !== -1 ? output[keyIdx - 1] : null;
  });

  const arch = xPlatform.getToolchainArch();
  const targetRoot = path.join(xPacman.getTargetRoot(distribution), arch);
  const targetTmp = path.join(targetRoot, 'tmp');
  const keyDetailsPath = path.join(targetTmp, 'keydetails');

  const keyId = yield readKey();
  if (keyId) {
    return keyId;
  }

  const killAgent = function* (next) {
    fse.removeSync(keyDetailsPath);
    yield xProcess.spawn(
      'gpgconf',
      ['--kill', 'gpg-agent'],
      {cwd: process.env.GNUPGHOME},
      next
    );
  };

  yield* killAgent(next);
  quest.defer(killAgent);

  const keyDetails = `
    %echo Generating an OpenPGP key
    Key-Type: RSA
    Key-Length: 4096
    Subkey-Type: RSA
    Subkey-Length: 4096
    Name-Real: ${distribution}
    Name-Comment: ${distribution}
    Name-Email: ${email}
    Expire-Date: 0
    %no-ask-passphrase
    %no-protection
    %pubring pubring.kbx
    %secring trustdb.gpg
    %commit
    %echo done
`;

  fse.ensureDirSync(targetTmp);
  fse.writeFileSync(keyDetailsPath, keyDetails);

  /* Generate a new key */
  yield xProcess.spawn(
    'gpg',
    ['--no-tty', '--batch', '--gen-key', keyDetailsPath],
    {cwd: process.env.GNUPGHOME},
    next
  );

  /* Set trust to 5 for the key so we can encrypt without prompt. */
  yield xProcess.spawn(
    `echo "5\ny\n" | gpg --no-tty --command-fd 0 --expert --edit-key ${email} trust;`,
    [],
    {shell: true, cwd: process.env.GNUPGHOME},
    next
  );

  /* Export the public key */
  yield xProcess.spawn(
    'gpg',
    [
      '--no-tty',
      '--export',
      '--output',
      path.join(repoDir, `public.gpg.key`),
      email,
    ],
    {cwd: process.env.GNUPGHOME},
    next
  );
  return yield readKey();
});

Goblin.registerQuest(goblinName, 'bootstrap', function* (quest) {
  yield quest.cmd('pacman.make', {
    packageArgs: ['gnupg+gnupg,@deps,debian+reprepro,@deps'],
  });
  yield quest.cmd('pacman.build', {
    packageRefs: 'gnupg+gnupg,debian+reprepro',
  });
  yield quest.cmd('pacman.install', {
    packageRefs: 'gnupg+gnupg,debian+reprepro',
  });
});

Goblin.registerQuest(goblinName, 'initialize', function* (
  quest,
  distribution,
  $suite = 'stable',
  next
) {
  xEnv.devrootUpdate(distribution);
  quest.defer(() => xEnv.devrootUpdate());

  const xProcess = require('xcraft-core-process')({
    logger: 'xlog',
    resp: quest.resp,
  });

  const arch = xPlatform.getToolchainArch();
  const targetRoot = path.join(xPacman.getTargetRoot(distribution), arch);
  const repoDir = path.join(targetRoot, 'var/deb');

  if (fse.existsSync(repoDir)) {
    quest.log.info(`the repository ${distribution} already exists`);
    return true;
  }

  fse.ensureDirSync(repoDir);
  const gpgKey = yield quest.me._generateKey({distribution, repoDir});

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

  const architecture = architectures[process.arch];
  const codeName = getOsRelease('VERSION_CODENAME');
  const distributionFile = `
Suite: ${$suite}
Codename: ${codeName}
Components: non-free
Architectures: ${architecture}
SignWith: ${gpgKey}
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

Goblin.registerQuest(goblinName, 'publishDeb', function* (
  quest,
  distribution,
  packageDeb,
  next
) {
  xEnv.devrootUpdate(distribution);
  quest.defer(() => xEnv.devrootUpdate());

  const xProcess = require('xcraft-core-process')({
    logger: 'xlog',
    resp: quest.resp,
  });

  const arch = xPlatform.getToolchainArch();
  const targetRoot = path.join(xPacman.getTargetRoot(distribution), arch);
  const repoDir = path.join(targetRoot, 'var/deb');
  const codeName = getOsRelease('VERSION_CODENAME');

  yield xProcess.spawn(
    'reprepro',
    ['-vb', repoDir, 'includedeb', codeName, packageDeb],
    {},
    next
  );
});

Goblin.registerQuest(goblinName, 'publishPackage', function* (
  quest,
  distribution,
  packageDistrib
) {
  const arch = xPlatform.getToolchainArch();
  const sourceRoot = path.join(xPacman.getTargetRoot(packageDistrib), arch);
  const sourceDeb = path.join(sourceRoot, 'opt/packages/deb');

  const files = xFs.lsfile(sourceDeb, new RegExp(`\\.deb$`));

  for (const file of files) {
    const packageDeb = path.join(sourceDeb, file);
    yield quest.me.publishDeb({distribution, packageDeb});
  }
});

Goblin.registerQuest(goblinName, 'removePackage', function* (
  quest,
  distribution,
  packageName,
  next
) {
  xEnv.devrootUpdate(distribution);
  quest.defer(() => xEnv.devrootUpdate());

  const xProcess = require('xcraft-core-process')({
    logger: 'xlog',
    resp: quest.resp,
  });

  const arch = xPlatform.getToolchainArch();
  const targetRoot = path.join(xPacman.getTargetRoot(distribution), arch);
  const repoDir = path.join(targetRoot, 'var/deb');
  const codeName = getOsRelease('VERSION_CODENAME');

  yield xProcess.spawn(
    'reprepro',
    ['-vb', repoDir, 'remove', codeName, packageName],
    {},
    next
  );
});

// FIXME: provide an higher level variant of postload for goblin exports
function _postload(msg, resp) {
  try {
    let {debHttp} = require('./index.js');
    debHttp = debHttp();
    if (debHttp) {
      /* Main server for HTTP access to repositories */
      debHttp.serve();
    }

    resp.events.send(`${goblinName}._postload.${msg.id}.finished`);
  } catch (ex) {
    resp.events.send(`${goblinName}._postload.${msg.id}.error`, {
      code: ex.code,
      message: ex.message,
      stack: ex.stack,
    });
  }
}

// Singleton
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
module.exports.handlers._postload = _postload;
Goblin.createSingle(goblinName);
