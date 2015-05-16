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
}];
