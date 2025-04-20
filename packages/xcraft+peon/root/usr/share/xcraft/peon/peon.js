'use strict';

const moduleName = 'peon';

const path = require('path');
const fs = require('fs');
const watt = require('gigawatts');

const xFs = require('xcraft-core-fs');
const xPeon = require('xcraft-contrib-peon');
const xPh = require('xcraft-core-placeholder');
const xPlatform = require('xcraft-core-platform');
const xEnv = require('xcraft-core-env');
const xPacman = require('xcraft-contrib-pacman');

function explodeName(name) {
  return {
    prefix: name.replace(/\+.*/, ''),
    name: name.replace(/.*\+/, '').replace(/-src$/, ''),
  };
}

function getBasePath(root, pkg) {
  const {isSrc} = pkg;
  let base = './';

  if (isSrc) {
    const expName = explodeName(pkg.name);
    base = `usr/src/${expName.prefix}+${expName.name}_${pkg.version}`;
  }

  return path.join(root, base);
}

class Action {
  constructor(pkg, root, currentDir, binaryDir, hook, resp, action) {
    this._pkg = pkg;
    this._share = currentDir;
    this._root = root;
    this._binaryDir = binaryDir;
    this._global = hook === 'global'; /* local otherwise */
    this._resp = resp;
    this._prefix = null;

    const wpkgControlFile = path.join(this._root, 'var/lib/wpkg/core/control');
    this._distribution =
      this._pkg.distribution ||
      this._controlParser(wpkgControlFile).Distribution;

    this._resp.log.info(`detected distribution: ${this._distribution}`);

    xEnv.devrootUpdate(this._distribution);

    const _distribution = this._distribution.replace('/', '');
    const configFallback = ['config.json'];
    const baseDistrib = _distribution.split('+')[0];
    if (_distribution !== baseDistrib) {
      configFallback.unshift(`config.${baseDistrib}.json`);
    }
    configFallback.unshift(`config.${_distribution}.json`);

    let data = null;

    for (const config of configFallback) {
      try {
        data = fs.readFileSync(path.join(this._share, config));
        break;
      } catch (ex) {
        if (ex.code !== 'ENOENT') {
          throw ex;
        }
      }
    }

    if (data) {
      this._config = JSON.parse(data);
    } else {
      if (action === 'makeall') {
        throw new Error(
          `this package cannot be built for ${this._distribution} because it looks like dedicated to one specific distribution`
        );
      }

      this._resp.log.warn(`no config file, ensure that it's a postrm action`);
      this._config = null;
    }

    watt.wrapAll(this);
  }

  _genConfig(subPackage, prefixDir, config) {
    const newConfig = {
      get: {},
      type: 'bin',
      configure: config.configure,
      rules: {
        type: 'configure',
        location: '',
        args: {},
      },
      embedded: true,
    };

    const data = JSON.stringify(newConfig, null, '  ');
    const fullName = this._share.match(/.[/\\]([^/\\]+)[/\\]([^/\\]+)[/\\]?$/);
    if (subPackage) {
      fullName[2] += `-${subPackage}`;
    }

    const shareDir = path.join(prefixDir, 'share', fullName[1], fullName[2]);
    xFs.mkdir(shareDir);

    fs.writeFileSync(path.join(shareDir, 'config.json'), data);
  }

  _getExtra() {
    const extra = {
      name: this._pkg.name,
      distribution: this._distribution,
      configure: this._config.configure,
      location: this._config.rules.location,
      embedded: this._config.embedded,
      forceConfigure: this._config.rules.type === 'configure',
    };

    if (this._config.get.prepare) {
      extra.prepare = this._config.get.prepare;
    }

    if (this._config.rules.env) {
      extra.env = Object.assign(
        {},
        process.env,
        xEnv.pp(this._config.rules.env)
      );
    }

    return extra;
  }

  _genBinWpkg(control, binaryDir) {
    const installDir = {};
    const prefixDir = {};
    let mainPackage = 0;
    const basePath = getBasePath(this._root, this._pkg);
    const extra = this._getExtra();

    const srcDir = path.join(
      this._share,
      'cache',
      extra.location.replace(/\/$/, '')
    );

    const subPackages = control['Sub-Packages']
      .split(', ')
      .map((subpackage, index) => {
        if (subpackage.indexOf('*') !== -1) {
          mainPackage = index;
          return subpackage.replace(/\*/, '');
        }
        return subpackage;
      });

    for (const subPackage of subPackages) {
      installDir[subPackage] = path.normalize(
        binaryDir.replace(/build$/, `install/${subPackage}`)
      );
      prefixDir[subPackage] = path.join(installDir[subPackage], 'usr');
    }

    const normalize = (location) => {
      if (extra.env?.PEON_UNIX_PATH === '1') {
        location = location.replace(/^([a-zA-Z]):/, '/$1');
      }
      return location.replace(/\\/g, '/');
    };

    xPh.global
      .set('SRCDIR', normalize(srcDir))
      .set('PREFIXDIR', normalize(prefixDir.runtime))
      .set('INSTALLDIR', normalize(installDir.runtime));

    subPackages
      .filter((subPackage) => subPackage !== 'runtime')
      .forEach((subPackage) => {
        const key = subPackage.toUpperCase();
        xPh.global
          .set(`PREFIXDIR.${key}`, normalize(prefixDir[subPackage]))
          .set(`INSTALLDIR.${key}`, normalize(installDir[subPackage]));
      });

    this._prefix = prefixDir;

    const etcPath = path.join(basePath, 'etc');
    const hasEtc = fs.existsSync(etcPath);
    const etcDirList = hasEtc ? xFs.lsdir(etcPath) : [];
    const etcFileList = hasEtc ? xFs.lsfile(etcPath) : [];

    for (let i = 0; i < subPackages.length; ++i) {
      const subPackage = subPackages[i];
      if (subPackage.startsWith('x+')) {
        continue;
      }

      /* Copy postinst and prerm scripts for the binary package. */
      const installWpkgDir = path.join(installDir[subPackage], 'WPKG');
      xFs.mkdir(installWpkgDir);
      const ph = new xPh.Placeholder();
      ['postinst', 'prerm'].forEach((script) => {
        script = script + xPlatform.getShellExt();
        const input = path.join(basePath, script);
        const output = path.join(installWpkgDir, script);
        if (mainPackage !== i) {
          ph.set('SUBNAME', subPackage);
        }
        ph.set('DISTRIBUTION', this._distribution) //
          .injectFile('PACMAN', input, output);
      });

      /* Generate the config.json file. */
      this._genConfig(
        mainPackage !== i ? subPackage : null,
        prefixDir[subPackage],
        this._config.runtime
      );

      const cp = (src, dst) => {
        this._resp.log.verb(`Copy ${src} to ${dst}`);
        xFs.cp(src, dst);
      };

      /* Copy etc/ files if available. */
      /* Common etc/ files. */
      etcFileList.forEach((file) =>
        cp(
          path.join(etcPath, file),
          path.join(installDir[subPackage], 'etc', file)
        )
      );

      /* etc/xxx, ... */
      etcDirList.forEach((dir) => {
        const dirPath = path.join(etcPath, dir);

        if (dir === 'env') {
          const envFileList = xFs.lsfile(dirPath);
          const envDirList = xFs.lsdir(dirPath);

          /* Common etc/env, ... files. */
          envFileList.forEach((file) =>
            cp(
              path.join(dirPath, file),
              path.join(installDir[subPackage], 'etc', dir, file)
            )
          );

          envDirList.forEach((type) => {
            const typeDirPath = path.join(dirPath, type);
            const typeFileList = xFs.lsfile(typeDirPath);
            const typeDirList = xFs.lsdir(typeDirPath);

            /* Common etc/env/path, etc/env/other files. */
            typeFileList.forEach((file) =>
              cp(
                path.join(typeDirPath, file),
                path.join(installDir[subPackage], 'etc', dir, type, file)
              )
            );

            /* Specific sub-package etc/env/path, etc/env/other, ... files. */
            if (typeDirList.indexOf(subPackage) !== -1) {
              cp(
                path.join(typeDirPath, subPackage),
                path.join(installDir[subPackage], 'etc', dir, type)
              );
            }
          });
        } else {
          cp(dirPath, path.join(installDir[subPackage], 'etc', dir));
        }
      });
    }
  }

  _targetRootFix(file) {
    const regex = new RegExp(
      `(?:[a-zA-Z]:|\\\\)?[\\/](?:(?![\\/]install[\\/][a-z]+)[^"'\n$])*[\\/]wpkg-[0-9]+[\\/]install[\\/][a-z]+([\\/]?[^"'\n$ ]+)?`,
      'g'
    );

    try {
      if (xFs.sed(file, regex, `${this._root.replace(/\\/g, '/')}$1`)) {
        this._resp.log.warn(`target root fixed for ${file}`);
      }
      return true;
    } catch (ex) {
      if (ex.code !== 'EACCES') {
        throw ex;
      }
      return false;
    }
  }

  _wrapForWriting(file, wrap) {
    const st = fs.lstatSync(file);
    if ((st.mode & 0o220) === 0o220) {
      wrap(file);
      return;
    }

    const mode = st.mode | 0o220; /* Set write rights */
    try {
      this._resp.log.warn(`read-only file, try to change mode for ${file}`);
      fs.chmodSync(file, mode);
      wrap(file, mode);
    } catch (ex) {
      if (ex.code !== 'EACCES') {
        throw ex;
      }
      this._resp.log.warn(`target root for ${file} cannot be fixed`);
    } finally {
      /* Restore original rights */
      fs.chmodSync(file, st.mode);
    }
  }

  _internalConfigure(fileList) {
    fileList.forEach((_file) => {
      const file = path.join(this._root, _file);

      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        return;
      }

      if (this._targetRootFix(file)) {
        return;
      }

      /* Read-only case */
      this._wrapForWriting(file, (file) => this._targetRootFix(file));
    });
  }

  *_patchApply(extra, next) {
    const xDevel = require('xcraft-core-devel');

    const patchesDir = path.join(this._share, 'patches');

    const srcDir =
      this._config.rules.type === 'move'
        ? this._root
        : path.join(this._share, 'cache', extra.location);

    try {
      yield xDevel.autoPatch(
        patchesDir,
        srcDir,
        extra.distribution,
        this._resp,
        next
      );
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
      this._resp.log.warn(
        'no cache directory, patches skipped (stub package?)'
      );
    }
  }

  *_peonRun(extra, next) {
    this._resp.log.verb(
      'Command: %s %s',
      extra.location,
      JSON.stringify(extra.args)
    );

    const peonAction = xPeon[this._config.type][this._config.rules.type];
    try {
      yield peonAction(
        this._config.get,
        getBasePath(this._root, this._pkg),
        this._share,
        extra,
        this._resp,
        next
      );
    } catch (ex) {
      this._resp.log.err(ex.stack || ex);
      this._resp.log.err(
        'Can not %s %s',
        this._config.rules.type,
        this._config.type
      );
      process.exitCode = 1;
    }
  }

  _listFromMD5Sums(md5sumsFile) {
    return fs
      .readFileSync(md5sumsFile)
      .toString()
      .split('\n')
      .filter((entry) => entry.trim().length)
      .map((entry) => entry.substring(34));
  }

  _listFromSymlinks(symlinksFile) {
    return fs.existsSync(symlinksFile)
      ? fs
          .readFileSync(symlinksFile)
          .toString()
          .split('\n')
          .filter((entry) => entry.trim().length)
          .map((entry) => entry.split('->')[0].trim())
      : [];
  }

  /* See https://github.com/blinkdog/debian-control */
  _controlParser(controlFile) {
    return fs
      .readFileSync(controlFile)
      .toString()
      .split('\n')
      .filter((row) => !!row)
      .reduce((ctrl, row) => {
        const map = row.split(':').map((entry) => entry.trim());
        ctrl[map[0]] = map[1];
        return ctrl;
      }, {});
  }

  *postinst() {
    const md5sumsFile = path.join(
      this._root,
      'var/lib/wpkg',
      this._pkg.name,
      'md5sums'
    );
    const symlinksFile = path.join(
      this._root,
      'var/lib/wpkg',
      this._pkg.name,
      'symlinks'
    );

    if (this._global) {
      const regexReplace = (newFile, regex, pattern) =>
        regex.test(newFile) ? newFile.replace(regex, pattern) : newFile;

      /* Restore the original filenames. */
      const listMD5 = this._listFromMD5Sums(md5sumsFile);
      const listSym = this._listFromSymlinks(symlinksFile);
      const list = listMD5.concat(listSym);

      /* No move here because the files are handled by wpkg. */
      list.forEach((file) => {
        let newFile = file;
        /* TODO: keep a file with all copies, then it can be removed
         *       with postrm.
         */
        newFile = regexReplace(newFile, /__peon_[0-9]+__/, '');
        newFile = regexReplace(newFile, /__peon__/, '');
        newFile = regexReplace(
          newFile,
          /__peon_(aux|con|com[1-9]|lpt[1-9]|nul|prn)(\.[^.]*)?__/,
          '$1$2'
        );
        newFile = regexReplace(newFile, /__peon_pipe__/g, '|');
        newFile = regexReplace(newFile, /__peon_space__/g, ' ');
        newFile = regexReplace(newFile, /__peon_quote__/g, '"');
        newFile = regexReplace(newFile, /__peon_colon__/g, ':');

        if (/__peon_symlink__/.test(newFile)) {
          const target = fs.readFileSync(file).toString();
          newFile = newFile.replace(/__peon_symlink__/, '');

          try {
            fs.unlinkSync(newFile);
          } catch (ex) {
            if (ex.code !== 'ENOENT') {
              throw ex;
            }
          }
          fs.symlinkSync(target, newFile);
        } else if (newFile !== file) {
          this._wrapForWriting(file, (file, mode) => {
            xFs.cp(file, newFile);
            if (mode) {
              fs.chmodSync(newFile, mode);
            }
          });
        } else {
          const st = fs.lstatSync(file);
          if (st.isSymbolicLink()) {
            let target = fs.readlinkSync(file);
            target = path.relative(
              path.dirname(path.join(this._root, file)),
              target
            );
            if (!target) {
              return; /* Continue with the next file because this symlink is strange */
            }
            try {
              fs.unlinkSync(file);
            } catch (ex) {
              if (ex.code !== 'ENOENT') {
                throw ex;
              }
            }
            fs.symlinkSync(target, file);
          }
        }
      });

      const wpkgPkg = path.join(this._root, 'var/lib/wpkg', this._pkg.name);
      const hasPostinst =
        fs.existsSync(path.join(wpkgPkg, 'postinst')) ||
        fs.existsSync(path.join(wpkgPkg, 'postinst.bat'));
      if (!hasPostinst && this._config.type !== 'src') {
        const extra = this._getExtra();
        yield this._patchApply(extra);
      }
      return;
    }

    if (!this._config) {
      this._resp.log.err(
        `no config file, postinst seems running on a broken package, we skip the peon step`
      );
      return;
    }

    const extra = this._getExtra();
    extra.args = {
      all: this._config.rules.args.postinst,
    };

    yield this._patchApply(extra);
    if (!extra.forceConfigure) {
      yield this._peonRun(extra);
      return;
    }

    try {
      const list = this._listFromMD5Sums(md5sumsFile);
      this._internalConfigure(list);
      yield this._peonRun(extra);
    } catch (ex) {
      this._resp.log.err(ex.stack || ex);
      process.exitCode = 1;
    }
  }

  *prerm() {
    const extra = this._getExtra();
    extra.args = {
      all: this._config.rules.args.prerm,
    };
    yield this._peonRun(extra);
  }

  postrm(wpkgAct) {
    if (!this._pkg.isSrc) {
      return;
    }

    if (wpkgAct === 'remove') {
      xFs.rm(getBasePath(this._root, this._pkg));
    }
  }

  _getInstalledPackages(distribution) {
    const arch = xPlatform.getToolchainArch();
    const targetRoot = path.join(xPacman.getTargetRoot(distribution), arch);

    return xFs
      .lsall(path.join(targetRoot, 'var/lib/wpkg'), false, (file) =>
        /^wpkg-status$/.test(file)
      )
      .filter((file) =>
        fs
          .readFileSync(file, 'utf8')
          .split('\n')
          .some((row) => row.startsWith('X-Status: Installed'))
      )
      .map((file) => {
        const dirname = path.dirname(file);
        const control = path.join(dirname, 'control');
        const version = fs
          .readFileSync(control, 'utf8')
          .split('\n')
          .filter((row) => row.startsWith('Version:'))[0]
          .split(':')[1]
          .trim();
        const name = path.basename(dirname);
        return `${name} (${version})`;
      })
      .join(', ');
  }

  *makeall() {
    const basePath = getBasePath(this._root, this._pkg);
    const changelogFile = path.join(basePath, 'wpkg/changelog');
    const controlFile = path.join(basePath, 'wpkg/control.info');

    const control = this._controlParser(controlFile);

    /* This condition is true only when wpkg is building a new binary package
     * from a source package.
     */
    if (this._binaryDir && this._binaryDir.length) {
      this._genBinWpkg(control, this._binaryDir);
    }

    const extra = this._getExtra();
    extra.args = {
      all: this._config.rules.args.makeall,
      test: this._config.rules.args.maketest,
      install: this._config.rules.args.makeinstall,
    };
    extra.test = this._config.rules.test;
    extra.deploy = this._config.deploy;
    extra.prefix = this._prefix;

    yield this._patchApply(extra);

    /* With source package, update the changelog, the control.info and the
     * makeall file in order to replace the list of distributions by the
     * target distribution.
     */
    const distributions = control.Distribution;

    if (
      !distributions
        .split(' ')
        .some((distrib) => distrib === this._distribution)
    ) {
      this._resp.log.warn(
        `This source package hasn't direct support for this distribution: ${this._distribution}`
      );
    }

    fs.writeFileSync(
      changelogFile,
      fs
        .readFileSync(changelogFile)
        .toString()
        .replace(`${distributions};`, `${this._distribution};`)
    );

    let dataControl = fs
      .readFileSync(controlFile)
      .toString()
      .replace(
        `Distribution: ${distributions}`,
        `Distribution: ${this._distribution}`
      );

    /* FIXME: add a way to inject more dependencies which are not buildable */

    if (this._distribution === 'toolchain/') {
      if (/\nDepends(?:\/[a-z]+)?: /.test(dataControl)) {
        dataControl = dataControl.replace(
          /(\nDepends(?:\/[a-z]+)?: [^\n]+)/,
          '$1, xcraft+peon'
        );
      }
      if (!/\nDepends: /.test(dataControl)) {
        dataControl += 'Depends: xcraft+peon\n';
      }
    }

    /* Inject the list of installed packages for this build. If the target
     * distribution is not 'toolchain', then inject both lists.
     */
    let installedPackages;
    if (this._distribution !== 'toolchain/') {
      installedPackages = this._getInstalledPackages(this._distribution);
      if (installedPackages) {
        dataControl += `X-Craft-Packages-${this._distribution.replace(
          /\/$/,
          ''
        )}: ${installedPackages}\n`;
      }
    }

    installedPackages = this._getInstalledPackages('toolchain/');
    if (installedPackages) {
      dataControl += `X-Craft-Packages-toolchain: ${installedPackages}\n`;
    }

    fs.writeFileSync(controlFile, dataControl);

    yield this._peonRun(extra);

    if (xPlatform.getOs() === 'win') {
      /* HACK: remove junctions because the links are related to a no longer
       *       available subst'ed drive.
       */
      xFs.rmSymlinks(basePath);
    }
  }
}

function guessSharePath(root, share, pkg) {
  const base = getBasePath(root, pkg);

  if (share) {
    return path.join(base, share);
  }

  const expName = explodeName(pkg.name);

  return path.join(base, `usr/share/${expName.prefix}/${expName.name}`);
}

if (process.argv.length >= 4) {
  const root = path.join(process.argv[2], process.argv[10]);
  const hook = process.argv[4];
  const action = process.argv[5];
  const wpkgAct = process.argv[6];
  const prefix = process.argv[7];
  const name = process.argv[8];
  const version = process.argv[9];
  const distribution = process.argv[11];
  const pkg = {
    name,
    version,
    distribution,
    isSrc: /-src$/.test(name) || action === 'makeall',
  };

  /* HACK: clean PATH; it can be altered by batch scripts like:
   *   set PATH=C:\\blabla;%PATH% && something else
   * A space is added at the end because it should be:
   *   set PATH=C:\\blabla;%PATH%&something else
   */
  process.env.PATH = process.env.PATH.trim();

  const share = guessSharePath(root, process.argv[3], pkg);

  process.env.PEON_SHARE = share;

  let resp;
  const xBusClient = require('xcraft-core-busclient');
  resp = xBusClient.newResponse(moduleName);

  require('xcraft-core-log')(moduleName, resp);

  resp.log.verb(
    `run the action '${action}' for ${pkg.name}\n - distribution: ${
      pkg.distribution || 'n/a'
    }\n - root: ${root || 'n/a'}\n - hook: ${hook || 'n/a'}\n - prefix: ${
      prefix || 'n/a'
    }\n - share: ${share || 'n/a'}`
  );

  const main = new Action(pkg, root, share, prefix, hook, resp, action);
  main[action](wpkgAct, (err) => {
    if (err) {
      resp.log.err(err);
      process.exitCode = 1;
    }
    if (action === 'makeall' && process.env.PEON_DEBUG_PKG === pkg.name) {
      process.exitCode = 100;
    }
  });
}
