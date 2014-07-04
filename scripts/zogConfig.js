
var moduleName = 'config';

var path       = require ('path');
var confWizard = require ('./config/confWizard.js')
var zogLog     = require ('zogLog') (moduleName);

process.chdir (path.join (__dirname, '/..'));

module.exports = function ()
{
  var yaml     = require ('js-yaml');
  var fs       = require ('fs');
  var inquirer = require ('inquirer');

  var zogPlatform = require ('zogPlatform');

  var userYaml    = './zog.yaml';
  var defaultYaml = './scripts/zog.yaml';

  var data = '';

  try
  {
    /* Try with the user config file if possible. */
    data = fs.readFileSync (userYaml, 'utf8');
  }
  catch (err)
  {
    /* Else, we use the default config file. */
    data = fs.readFileSync (defaultYaml, 'utf8');
  }

  var conf = yaml.safeLoad (data);

  return {
    /* TODO: add support to configure other parts. */
    configure: function ()
    {
      zogLog.info ('configure zog (chest server)');

      confWizard.chest.forEach (function (item)
      {
        item.default = conf.chest[item.name];
      });

      inquirer.prompt (confWizard.chest, function (answers)
      {
        var hasChanged = false;

        zogLog.verb ('JSON output:\n' + JSON.stringify (answers, null, '  '));

        Object.keys (answers).forEach (function (item)
        {
          if (conf.chest[item] != answers[item])
          {
            conf.chest[item] = answers[item];
            hasChanged = true;
          }
        });

        if (hasChanged)
        {
          data = yaml.safeDump (conf);
          fs.writeFileSync (userYaml, data);
        }
      });
    },

    architectures:
    [
      'win32',
      'win64',
      'linux-i386',
      'linux-amd64',
      'darwin-i386',
      'darwin-amd64',
      'solaris-i386',
      'solaris-amd64',
      'freebsd-i386',
      'freebsd-amd64',
      'source'
    ],

    chest: conf.chest,

    /* FIXME: must have a better handling. */
    pkgCfgFileName  : 'config.yaml',
    pkgInstaller    : 'peon.js',
    pkgPostinst     : 'postinst' + zogPlatform.getShellExt (),
    pkgRepository   : 'toolchain/',
    pkgIndex        : 'index.tar.gz',

    /* Path helpers. */
    toolchainRoot   : path.resolve ('./'),
    libRoot         : path.resolve ('./scripts/lib/'),
    loktharRoot     : path.resolve ('./lokthar/'),
    nodeModulesRoot : path.resolve ('./node_modules/'),
    tempRoot        : path.resolve ('./var/tmp/'),
    pkgTempRoot     : path.resolve ('./var/tmp/wpkg/'),
    pkgDebRoot      : path.resolve ('./var/wpkg/'),
    pkgBaseRoot     : path.resolve ('./packages/base/'),
    pkgProductsRoot : path.resolve ('./packages/products/'),
    pkgTemplatesRoot: path.resolve ('./templates/wpkg/'),
    pkgTargetRoot   : path.resolve ('./var/devroot/'),
    chestServer     : path.resolve ('./scripts/chest/chestServer.js'),

    /* Lib helpers. */
    libPkgCreate    : path.resolve ('./scripts/manager/pkgCreate.js'),
    libPkgList      : path.resolve ('./scripts/manager/pkgList.js'),
    libPkgWizard    : path.resolve ('./scripts/manager/pkgWizard.js'),
    libPkgControl   : path.resolve ('./scripts/manager/pkgControl.js'),
    libPkgMake      : path.resolve ('./scripts/manager/pkgMake.js'),
    libPkgCmd       : path.resolve ('./scripts/manager/pkgCmd.js'),

    /* Bin helpers. */
    binGrunt        : path.join ('./node_modules/', 'grunt-cli/bin/grunt')
  };
}
