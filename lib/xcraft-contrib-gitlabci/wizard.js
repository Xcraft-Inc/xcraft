'use strict';

exports.runner = [{
  type: 'input',
  name: 'token',
  message: 'GitLab CI token'
}, {
  type: 'input',
  name: 'timeout',
  message: 'Timeout [seconds] after considering a failure (0 in order to use the CI project settings)',
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
  default: 110
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
}, {
  type: 'list',
  name: 'platform',
  message: 'Platform',
  choices: [
    'win',
    'darwin',
    'linux'
  ]
}];

// FIXME: factorize
exports.xcraftCommands = function () {
  var cmd = {};
  const rc = {};

  var tryPushFunction = function (fieldDef, category, funcName) {
    if (!fieldDef.hasOwnProperty (funcName)) {
      return;
    }

    /* generating cmd and result event name */
    var cmdName = category + '.' + fieldDef.name + '.' + funcName;

    var evtName = `wizard.${category}.${fieldDef.name}.${funcName}.finished`;

    /* Indicate to lokthar that a command for validation is available
     * and corresponding result event.
     */
    fieldDef.loktharCommands['wizard.' + cmdName] = evtName;
    cmd[cmdName] = function (msg, response) {
      /* execute function */
      var result = fieldDef[funcName] (msg.data);
      response.events.send (evtName, result);
    };
    rc[cmdName] = {
      parallel: true
    };
  };

  var extractCommandsHandlers = function (category) {
    var fields = exports[category];

    Object.keys (fields).forEach (function (index) {
      var fieldDef = fields[index];
      fieldDef.loktharCommands = {};

      tryPushFunction (fieldDef, category, 'validate');
      tryPushFunction (fieldDef, category, 'choices');
      tryPushFunction (fieldDef, category, 'filter');
      tryPushFunction (fieldDef, category, 'when');
    });
  };

  /* extacts cmds handlers for each category */
  Object.keys (exports).forEach (function (exp) {
    if (exp !== 'xcraftCommands') {
      extractCommandsHandlers (exp);
    }
  });

  return {
    handlers: cmd,
    rc: rc
  };
};
