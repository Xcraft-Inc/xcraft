'use strict';

/**
 * Retrieve the inquirer definition for xcraft-core-etc
 */
module.exports = [{
  type: 'input',
  name: 'url',
  message: 'GitLab CI url',
  default: 'https://ci.epsitec.ch'
}, {
  type: 'confirm',
  name: 'strictSSL',
  message: 'Use strict SSL?',
  default: true
}, {
  type: 'input',
  name: 'configDir',
  message: 'Runners repository:',
  default: './var/xcraft-contrib-gitlabci/'
}];
