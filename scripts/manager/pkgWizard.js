
var path      = require ('path');
var inquirer  = require ('inquirer');
var zogConfig = require ('../zogConfig.js') ();
var zogFs     = require ('../lib/zogFs.js');

/* Version rules by Debian:
 * http://windowspackager.org/documentation/implementation-details/debian-version
 */
var versionRegex = /(|[0-9]+:)([0-9][-+:~.0-9a-zA-Z]*)(|-[+~.0-9a-zA-Z]+)/;

exports.header =
[
  {
    type: 'input',
    name: 'package',
    message: 'Package name',
    validate: function (value)
    {
      /* Naming rules by Debian:
       * Must consist only of lower case letters (a-z), digits (0-9), plus (+)
       * and minus (-) signs, and periods (.). They must be at least two
       * characters long and must start with an alphanumeric character.
       */
      return /^[a-z0-9]{1}[a-z0-9+-.]{1,}$/.test (value);
    }
  },
  {
    type: 'input',
    name: 'version',
    message: 'Package version',
    validate: function (value)
    {
      regex = new RegExp ('^' + versionRegex.source + '$');
      return regex.test (value);
    }
  },
  {
    type: 'input',
    name: 'maintainerName',
    message: 'Maintainer\'s name',
    validate: function (value)
    {
      if (!value.trim ())
        return 'The maintainer\'s name is mandatory.'

      return true;
    }
  },
  {
    type: 'input',
    name: 'maintainerEmail',
    message: 'Maintainer\'s email',
    validate: function (value)
    {
      var mailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return mailRegex.test (value);
    }
  },
  {
    type: 'checkbox',
    name: 'architecture',
    message: 'Host architecture',
    choices:
    [
      new inquirer.Separator ('== Common =='),
      {
        name: 'all',
      },
      {
        name: 'win32',
        checked: true
      },
      {
        name: 'win64'
      },
      {
        name: 'linux-i386',
      },
      {
        name: 'linux-amd64',
      },
      {
        name: 'darwin-i386',
      },
      {
        name: 'darwin-amd64',
      },
      {
        name: 'source'
      },
      new inquirer.Separator ('== Extras =='),
      {
        name: 'solaris-i386',
      },
      {
        name: 'solaris-amd64',
      },
      {
        name: 'freebsd-i386',
      },
      {
        name: 'freebsd-amd64',
      }
    ],
    validate: function (value)
    {
      if (value.length < 1)
        return 'You must choose at least one topping.';

      return true;
    },
    filter: function (answer)
    {
      if (answer.indexOf ('all') != -1)
        return [ 'all' ];

      var mergeArch = function (os)
      {
        var ms0 = answer.indexOf (os + '-i386');
        var ms1 = answer.indexOf (os + '-amd64');
        if (ms0 < 0 || ms1 < 0)
          return;

        answer.splice (ms0, 1);
        ms1 = answer.indexOf (os + '-amd64');
        answer.splice (ms1, 1);
        answer.push (os + '-any');
      };

      [
        'mswindows',
        'linux',
        'darwin',
        'solaris',
        'freebsd'
      ].forEach (function (os) {
        mergeArch (os);
      });

      return answer;
    }
  },
  {
    type: 'input',
    name: 'descriptionBrief',
    message: 'Brief description (max 70 characters):',
    validate: function (value)
    {
      if (value.length > 70)
        return 'The brief description must not be longer than 70 characters.';

      if (!value.trim ())
        return 'The brief description is mandatory.'

      return true;
    }
  },
  {
    type: 'input',
    name: 'descriptionLong',
    message: 'Long description',
    loktharType : 'multi-line'
  }
];

exports.dependency =
[
  {
    type: 'confirm',
    name: 'hasDependency',
    message: 'Add a dependency',
    default: false
  },
  {
    type: 'rawlist',
    name: 'dependency',
    message: 'Package\'s name',
    choices: zogFs.lsdir (zogConfig.pkgProductsRoot),
    when: function (answers)
    {
      return answers.hasDependency;
    }
  },
  {
    type: 'input',
    name: 'version',
    message: 'Empty string or range operator (>>, >=, =, <= or <<) with version (like >= 1.0):',
    validate: function (value)
    {
      var rangeRegex = /((<[<=]|>[>=])|=)/;
      var regex = new RegExp ('^(|' + rangeRegex.source + '[ ]{1}' + versionRegex.source + ')$');
      return regex.test (value);
    },
    when: function (answers)
    {
      return answers.hasDependency;
    }
  }
];

exports.data =
[
  {
    type: 'input',
    name: 'uri',
    message: 'URI'
  },
  {
    type: 'list',
    name: 'type',
    message: 'Type of data',
    /* TOTO: it must be a dynamic list like for the products. */
    choices:
    [
      {
        name: 'bin'
      },
      {
        name: 'zip'
      },
      {
        name: 'git'
      },
      {
        name: 'svn'
      }
    ]
  }
];

exports.chest =
[
  {
    type: 'confirm',
    name: 'mustUpload',
    message: 'Upload your file to the chest server',
    default: false
  },
  {
    type: 'input',
    name: 'localPath',
    message: 'Location on the file to upload',
    when: function (answers)
    {
      return answers.mustUpload;
    }
  }
];
