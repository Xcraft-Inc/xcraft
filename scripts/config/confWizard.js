
exports.chest =
[
  {
    type: 'input',
    name: 'host',
    message: 'hostname or IP'
  },
  {
    type: 'input',
    name: 'port',
    message: 'listening port',
    validate: function (value)
    {
      return /^[0-9]{1,}$/.test (value);
    }
  },
  {
    type: 'input',
    name: 'pid',
    message: 'pid filename'
  },
  {
    type: 'input',
    name: 'log',
    message: 'log filename'
  },
  {
    type: 'input',
    name: 'repository',
    message: 'path to the repository'
  }
];
