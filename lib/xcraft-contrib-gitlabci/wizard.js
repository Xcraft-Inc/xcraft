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
  message: 'Timeout [seconds] after that the runner considers that the command has failed',
  validate: function (value) {
    return /^[0-9]+$/.test (value);
  },
  default: 3600
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
