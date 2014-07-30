'use strict';

var moduleName = 'manager';

var path     = require ('path');
var inquirer = require ('inquirer');

var zogConfig = require ('./zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);
var pkgCreate = require (zogConfig.libPkgCreate);

process.chdir (path.join (__dirname, '/..'));

exports.list = function ()
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
                 def.architecture.toString ().replace (/,/g, ', '));
  });
};

/**
 * Create a new package template or modify an existing package config file.
 * @param {string} packageName
 */
exports.create = function (packageName)
{
  zogLog.info ('create a new package: ' + packageName);

  var wizard = require (zogConfig.libPkgWizard);
  var packageDef = [];

  /* The first question is the package's name, then we set the default value. */
  wizard.header[0].default = packageName;

  try
  {
    var pkgControl = require (zogConfig.libPkgControl);

    try
    {
      var def = pkgControl.loadPackageDef (packageName);
      wizard.header[1].default = def.version;
      wizard.header[2].default = def.maintainer.name;
      wizard.header[3].default = def.maintainer.email;
      wizard.header[4].default = def.architecture;
      wizard.header[5].default = def.description.brief;
      wizard.header[6].default = def.description.long;

      wizard.data[0].default = def.data.uri;
      wizard.data[1].default = def.data.type;
      wizard.data[2].default = def.data.rules.type;
      wizard.data[3].default = def.data.rules.bin;
      wizard.data[4].default = def.data.rules.args;
      wizard.data[5].default = def.data.embedded;
    }
    catch (err) {}
  }
  catch (err)
  {
    zogLog.err (err);
  }

  var promptForData = function ()
  {
    inquirer.prompt (wizard.data, function (answers)
    {
      packageDef.push (answers);

      zogLog.verb ('JSON output (inquirer):\n' + JSON.stringify (packageDef, null, '  '));
      pkgCreate.pkgTemplate (packageDef);
    });
  };

  var promptForDependency = function ()
  {
    inquirer.prompt (wizard.dependency, function (answers)
    {
      packageDef.push (answers);

      if (answers.hasDependency)
        promptForDependency ();
      else
        promptForData ();
    });
  };

  inquirer.prompt (wizard.header, function (answers)
  {
    packageDef.push (answers);
    promptForDependency ();
  });
};

/**
 * Make the Control file for WPKG by using a package config file.
 * @param {string} packageName
 */
exports.make = function (packageName)
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
    pkgMake.package (packageName);
};

/**
 * Try to install the developement package.
 * @param {string} packageName
 */
exports.install = function (packageRef)
{
  zogLog.info ('install development package: ' + packageRef);

  var pkgCmd = require (zogConfig.libPkgCmd);

  pkgCmd.install (packageRef);
};

/**
 * Try to remove the developement package.
 * @param {string} packageName
 */
exports.remove = function (packageRef)
{
  zogLog.info ('remove development package: ' + packageRef);

  var pkgCmd = require (zogConfig.libPkgCmd);

  pkgCmd.remove (packageRef);
};

/**
 * Remove all the generated files.
 */
exports.clean = function ()
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
};
