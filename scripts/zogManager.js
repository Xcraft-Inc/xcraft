'use strict';

var moduleName = 'manager';

var path     = require ('path');
var inquirer = require ('inquirer');

var zogConfig = require ('./zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);
var pkgCreate = require (zogConfig.libPkgCreate);
var busClient = require (zogConfig.busClient);


var cmd       = {};
process.chdir (path.join (__dirname, '/..'));

cmd.list = function ()
{
  var util = require ('util');

  zogLog.info ('list of all products');

  var pkgList = require (zogConfig.libPkgList);

  var list = pkgList.listProducts ();
  var header = util.format ('name%s version%s architectures',
                            Array (40 - 'name'.length).join (' '),
                            Array (15 - 'version'.length).join (' '));
  console.log (header);
  console.log (Array (header.length + 1).join ('-'));
  list.forEach (function (def)
  {
    console.log ('%s%s %s%s',
                 def.name,
                 Array (40 - def.name.length).join (' '),
                 def.version,
                 Array (15 - def.version.toString ().length).join (' '),
                 def.architecture.join (', '));
  });

  busClient.events.send ('zogManager.list', list);
  busClient.events.send ('zogManager.list.finish');
};

/**
 * Create a new package template or modify an existing package config file.
 * @param {Object} msg
 */
cmd.edit = function (msg)
{
  var packageName = msg.data.packageName;
  msg.data.isPassive   = false;
  msg.data.packageDef  = [];

  zogLog.info ('create a new package: ' + packageName);

  try
  {
    busClient.command.send('zogManager.edit.header', msg.data);
  }
  catch (err)
  {
    zogLog.err (err);
  }
};

cmd['edit.header'] = function (msg)
{

  var packageName = msg.data.packageName;
  var packageDef  = msg.data.packageDef;
  var isPassive   = msg.data.isPassive;

  var pkgControl  = require (zogConfig.libPkgControl);
  var wizard      = require (zogConfig.libPkgWizard);

  /* The first question is the package's name, then we set the default value. */
  wizard.header[0].default = packageName;

  try
  {
    var def = pkgControl.loadPackageDef (packageName);
    wizard.header[1].default = def.version;
    wizard.header[2].default = def.maintainer.name;
    wizard.header[3].default = def.maintainer.email;
    wizard.header[4].default = def.architecture;
    wizard.header[5].default = def.description.brief;
    wizard.header[6].default = def.description.long;
  }
  catch (err) {}

  if(!isPassive)
  {
    inquirer.prompt (wizard.header, function (answers)
    {
      packageDef.push (answers);
      busClient.command.send ('zogManager.edit.add.dependency',
                              msg.data,
                              null);
    });
  }
  else
  {
    busClient.events.send ('zogManager.create.header', wizard.header);
  }

};

cmd['edit.add.dependency'] = function (msg)
{
  var packageDef  = msg.data.packageDef;
  var isPassive   = msg.data.isPassive;
  var wizard      = require (zogConfig.libPkgWizard);

  if(!isPassive)
  {
    inquirer.prompt (wizard.dependency, function (answers)
    {
      packageDef.push (answers);

      if (answers.hasDependency)
      {
        busClient.command.send ('zogManager.edit.add.dependency',
                                msg.data,
                                null);
      }
      else
      {
        busClient.command.send ('zogManager.edit.add.data',
                                msg.data,
                                null);
      }
    });
  }
  else
  {
    busClient.events.send ('zogManager.edit.dependency.added', wizard.dependency);
  }

};

cmd['edit.add.data'] = function (msg)
{
  var packageName = msg.data.packageName;
  var packageDef  = msg.data.packageDef;
  var isPassive   = msg.data.isPassive;

  var pkgControl = require (zogConfig.libPkgControl);
  var wizard     = require (zogConfig.libPkgWizard);

  try
  {
    var def = pkgControl.loadPackageDef (packageName);

    wizard.data[0].default = def.data.uri;
    wizard.data[1].default = def.data.type;
    wizard.data[2].default = def.data.rules.type;
    wizard.data[3].default = def.data.rules.bin;
    wizard.data[4].default = def.data.rules.args.install;
    wizard.data[5].default = def.data.rules.args.remove;
    wizard.data[6].default = def.data.embedded;
  }
  catch (err) {}

  if(!isPassive)
  {
    inquirer.prompt (wizard.data, function (answers)
    {
      packageDef.push (answers);
      busClient.command.send ('zogManager.edit.save', msg.data);
    });
  }
  else
  {
    busClient.events.send ('zogManager.edit.data.added', wizard.data);
  }
};

cmd['edit.save'] = function (msg)
{
  var packageDef  = msg.data.packageDef;

  zogLog.verb ('JSON output for package definition:\n' + JSON.stringify (packageDef, null, '  '));
  pkgCreate.pkgTemplate (packageDef, function (done)
  {
    busClient.events.send ('zogManager.edit.finish');
  });
};

/**
 * Make the Control file for WPKG by using a package config file.
 * @param {string} packageName
 */
cmd.make = function (packageName)
{
  zogLog.info ('make the wpkg package for ' + (packageName || 'all'));

  var pkgMake = require (zogConfig.libPkgMake);

  if (!packageName)
    packageName = 'all';

  if (packageName == 'all')
  {
    /* We use a grunt task for this job (with mtime check). */
    var grunt     = require ('grunt');
    var gruntFile = path.join (zogConfig.toolchainRoot, 'Gruntfile.js');
    var zogMake   = require (gruntFile) (grunt);

    grunt.tasks ([ 'newer' ]);
  }
  else
    pkgMake.package (packageName, null); /* TODO: arch support */
};

/**
 * Try to install the developement package.
 * @param {Object} msg
 */
cmd.install = function (packageRef)
{
  zogLog.info ('install development package: ' + packageRef);

  var pkgCmd = require (zogConfig.libPkgCmd);

  pkgCmd.install (packageRef);
};

/**
 * Try to remove the developement package.
 * @param {Object} msg
 */
cmd.remove = function (msg)
{
  var packageRef = msg.data;

  zogLog.info ('remove development package: ' + packageRef);

  var pkgCmd = require (zogConfig.libPkgCmd);

  pkgCmd.remove (packageRef, function (done)
  {
    busClient.events.send ('zogManager.remove.finish');
  });
};

/**
 * Remove all the generated files.
 */
cmd.clean = function ()
{
  var fse   = require ('fs-extra');
  var zogFs = require ('zogFs');

  zogLog.info ('clean all generated files');

  zogLog.verb ('delete ' + zogConfig.pkgTargetRoot);
  fse.removeSync (zogConfig.pkgTargetRoot);

  zogLog.verb ('delete ' + zogConfig.pkgDebRoot);
  fse.removeSync (zogConfig.pkgDebRoot);

  zogFs.ls (zogConfig.tempRoot, /^(?!.*\.gitignore)/).forEach (function (file)
  {
    file = path.join (zogConfig.tempRoot, file);
    zogLog.verb ('delete ' + file);

    var st = fse.statSync (file);
    if (st.isDirectory (file))
      fse.removeSync (file);
    else
      fse.unlinkSync (file);
  });

  busClient.events.send ('zogManager.clean.finish');
};

exports.busCommands = function ()
{
  var list = [];

  Object.keys (cmd).forEach (function (action)
  {
    list.push (
    {
      name    : action,
      handler : cmd[action]
    });
  });

  return list;
};

/**
 * Publish commands for std module exports.
 */
var main = function ()
{
  Object.keys (cmd).forEach (function (action)
  {
    exports[action] = cmd[action];
  });
};

main ();
