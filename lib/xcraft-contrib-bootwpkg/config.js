'use strict';

/**
 * Retrieve the inquirer definition for xcraft-core-etc.
 */
module.exports = [{
  type: 'input',
  name: 'name',
  message: 'package name',
  default: 'unigw'
}, {
  type: 'input',
  name: 'version',
  message: 'version',
  default: '1.0.0'
}, {
  type: 'input',
  name: 'src',
  message: 'source URI',
  default: 'http://downloads.sourceforge.net/project/unigw/wpkg/1.0.0/unigw-1.0.0.tar.gz'
}, {
  type: 'input',
  name: 'out',
  message: 'output directory',
  default: './usr'
}];
