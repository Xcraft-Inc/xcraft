
var path      = require ('path');
var inquirer  = require ('inquirer');
var zogConfig = require ('../zogConfig.js') ();
var zogFs     = require ('zogFs');

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
    choices: function ()
    {
      var list = [];

      list.push ({ name: 'all' });
      list.push ({ name: 'source' });
      list.push (new inquirer.Separator ('== Architectures =='));
      zogConfig.architectures.forEach (function (arch)
      {
        list.push ({ name: arch });
      });

      return list;
    },
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
    name: 'fileType',
    message: 'Type of data',
    /* TODO: it must be a dynamic list like for the products. */
    choices:
    [
      {
        name: 'bin'
      },
      {
        name: 'src'
      },
      {
        name: 'git'
      },
      {
        name: 'svn'
      }
    ]
  },
  {
    type: 'list',
    name: 'installType',
    message: 'How to install',
    /* TODO: it must be a dynamic list like for the products. */
    choices:
    [
      {
        name: 'exec'
      },
      {
        name: 'copy'
      }
    ],
    when: function (answers)
    {
      return answers.fileType == 'bin';
    }
  },
  {
    type: 'input',
    name: 'installArgs',
    message: 'Arguments for the installer',
    when: function (answers)
    {
      return answers.installType == 'exec';
    }
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
