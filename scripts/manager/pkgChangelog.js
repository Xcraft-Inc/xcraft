'use strict';

var moduleName = 'manager';

var path      = require ('path');
var util      = require ('util');
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);


var pad = function (n, w)
{
  n = n + '';
  return n.length >= w ? n : new Array (w - n.length + 1).join ('0') + n;
};

/**
 * Convert a zog package definition to a ChangeLog file.
 * @param {Object} packageDef
 * @returns {string} A ChangeLog file.
 */
var defToChangelog = function (packageDef)
{
  var changelog = '';

  /* The package definition is wrong if there is more than one architecture
   * when at least the 'source' architecture is set.
   */
  if (packageDef.architecture[0] !== 'source')
    return null;

  changelog = util.format ('%s (%s) %s; urgency=low\n\n',
                           packageDef.name,
                           packageDef.version,
                           packageDef.distribution);
  changelog += '  * Package source.\n';
  changelog += util.format ('\n -- %s <%s>  ',
                            packageDef.maintainer.name,
                            packageDef.maintainer.email);

  var date = new Date ();
  var d = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
  var m = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

  var offset = date.getTimezoneOffset () / 60;
  var sign = '+';
  if (offset < 0)
  {
    sign = '-';
    offset = -offset;
  }

  changelog += util.format ('%s, %s %s %d %s:%s:%s %s%s\n',
                            d[date.getDay ()],
                            pad (date.getDate (), 2),
                            m[date.getMonth ()],
                            date.getFullYear (),
                            pad (date.getHours (), 2),
                            pad (date.getMinutes (), 2),
                            pad (date.getSeconds (), 2),
                            sign,
                            pad (offset, 4));

  zogLog.verb (util.format ('ChangeLog file:\n%s', changelog));

  return changelog;
};

/**
 * Generate and save all ChangeLog files accordingly to the config.yaml files.
 * @param {string} packageName
 * @param {boolean} saveFiles - Saves the control files.
 * @returns {string[]} The list of all control file paths.
 */
exports.changelogFile = function (packageName, saveFiles)
{
  if (saveFiles)
    zogLog.info ('if necessary, save the ChangeLog file for ' + packageName);

  var fs = require ('fs');

  var zogFs         = require ('zogFs');
  var zogPlatform   = require ('zogPlatform');
  var pkgDefinition = require (zogConfig.libPkgDefinition);

  var def       = pkgDefinition.load (packageName);
  var changelog = defToChangelog (def);

  var changelogFiles = [];

  /* Only for source packages. */
  if (!changelog)
    return [];

  var wpkgDir       = path.join (zogConfig.pkgTempRoot, 'source', packageName, zogConfig.pkgWPKG);
  var changelogFile = path.join (wpkgDir, 'ChangeLog');

  if (saveFiles)
  {
    if (fs.existsSync (changelogFile))
      zogLog.warn ('the ChangeLog file will be overwritten: ' + changelogFile);

    zogFs.mkdir (wpkgDir);
    fs.writeFileSync (changelogFile, changelog);
  }

  changelogFiles.push (
  {
    'control': changelogFile
  });

  return changelogFiles;
};
