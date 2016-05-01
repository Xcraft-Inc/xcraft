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
  default: '1.0.2'
}, {
  type: 'input',
  name: 'src',
  message: 'source URI',
  default: 'https://github.com/Skywalker13/unigw/archive/cf58947c03a304e67a2f283ca1943d0ed3b898d5.tar.gz'
}, {
  type: 'input',
  name: 'out',
  message: 'output directory',
  default: './usr'
}];
