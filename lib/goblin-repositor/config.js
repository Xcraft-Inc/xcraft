'use strict';

module.exports = [
  {
    type: 'confirm',
    name: 'http.enabled',
    message: 'enable HTTP server for Debian repositories',
    default: true,
  },
  {
    type: 'input',
    name: 'http.port',
    message: 'set the HTTP server port for the repositories',
    default: 23432,
  },
  {
    type: 'input',
    name: 'http.hostname',
    message: 'set the HTTP hostname for the repositories',
    default: '0.0.0.0',
  },
  {
    type: 'input',
    name: 'osRelease',
    message: 'OS release like stretch, buster, ...',
    default: '',
  },
];
