'use strict';

exports.runner = [{
  type: 'input',
  name: 'token',
  message: 'GitLab CI token',
  validate: function (value) {
    if (!/^[a-fA-F0-9]+$/.test (value)) {
      return 'A token must only have hexadecimal characters.';
    }

    return true;
  }
}, {
  type: 'input',
  name: 'timeout',
  message: 'Timeout [seconds] after that the runner considers that it fails (0 in order to use the CI project settings)',
  validate: function (value) {
    return /^[0-9]*$/.test (value);
  },
  default: 0
}, {
  type: 'input',
  name: 'interval',
  message: 'Polling interval [milliseconds] for getting build tasks',
  validate: function (value) {
    return /^[0-9]+$/.test (value);
  },
  default: 5000
}, {
  type: 'input',
  name: 'updateInterval',
  message: 'Update interval [milliseconds] for the GitLab CI logs page',
  validate: function (value) {
    return /^[0-9]+$/.test (value);
  },
  default: 3000
}, {
  type: 'input',
  name: 'logWidth',
  message: 'Maximum width for log output',
  validate: function (value) {
    return /^[0-9]+$/.test (value);
  },
  default: 120
}, {
  type: 'input',
  name: 'host',
  message: 'Xcraft server (where sent commands)',
  default: '127.0.0.1'
}, {
  type: 'input',
  name: 'commanderPort',
  message: 'Command port',
  validate: function (value) {
    return /^[0-9]+$/.test (value);
  },
  default: 9100
}, {
  type: 'input',
  name: 'notifierPort',
  message: 'Notifier port',
  validate: function (value) {
    return /^[0-9]+$/.test (value);
  },
  default: 9300
}];
