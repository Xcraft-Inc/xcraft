'use strict';

/**
 * Retrieve the inquirer definition for xcraft-core-etc.
 */
module.exports = [{
  type: 'input',
  name: 'name',
  message: 'package name',
  default: 'wpkg'
}, {
  type: 'input',
  name: 'version',
  message: 'version',
  default: '0.9.10'
}, {
  type: 'input',
  name: 'src',
  message: 'source URI',
  default: 'http://downloads.sourceforge.net/project/unigw/wpkg/0.9.10/wpkg_0.9.10.tar.gz'
}, {
  type: 'input',
  name: 'out',
  message: 'output directory',
  default: './usr'
}];
