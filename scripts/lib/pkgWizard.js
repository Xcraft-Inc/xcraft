
var path      = require ('path');
var inquirer  = require ('inquirer');
var zogFs     = require ('./zogFs.js');
var zogConfig = require ('./zogConfig.js');

/* Version rules by Debian:
 * http://windowspackager.org/documentation/implementation-details/debian-version
 */
var versionRegex = /(|[0-9]+:)([0-9][-+:~.0-9a-zA-Z]*)(|-[+~.0-9a-zA-Z]+)/;

exports.header =
[
  {
    "type": "input",
    "name": "version",
    "message": "Package version",
    "validate": function (value)
    {
      regex = new RegExp ('^' + versionRegex.source + '$');
      return regex.test (value);
    }
  },
  {
    "type": "input",
    "name": "maintainerName",
    "message": "Maintainer's name"
  },
  {
    "type": "input",
    "name": "maintainerEmail",
    "message": "Maintainer's email",
    "validate": function (value)
    {
      var mailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return mailRegex.test (value);
    }
  },
  {
    "type": "checkbox",
    "name": "architecture",
    "message": "Host architecture",
    "choices":
    [
      new inquirer.Separator ("== Common =="),
      {
        "name": "all",
      },
      {
        "name": "mswindows-i386",
        "checked": true
      },
      {
        "name": "mswindows-amd64",
        "checked": true
      },
      {
        "name": "linux-i386",
      },
      {
        "name": "linux-amd64",
      },
      {
        "name": "darwin-i386",
      },
      {
        "name": "darwin-amd64",
      },
      {
        "name": "source"
      },
      new inquirer.Separator ("== Extras =="),
      {
        "name": "solaris-i386",
      },
      {
        "name": "solaris-amd64",
      },
      {
        "name": "freebsd-i386",
      },
      {
        "name": "freebsd-amd64",
      }
    ],
    "validate": function (value)
    {
      if (value.length < 1)
        return "You must choose at least one topping.";

      return true;
    },
    "filter": function (answer)
    {
      if (answer.indexOf ('all') != -1)
        return [ 'all' ];

      return answer;
    }
  },
  {
    "type": "input",
    "name": "descriptionBrief",
    "message": "Brief description"
  },
  {
    "type": "input",
    "name": "descriptionLong",
    "message": "Long description"
  }
];

exports.dependency =
[
  {
    "type": "confirm",
    "name": "hasMoreDependency",
    "message": "Add a dependency",
    "default": false
  },
  {
    "type": "rawlist",
    "name": "dependency",
    "message": "Package's name",
    "choices": zogFs.lsdir (zogConfig.pkgProductsRoot),
    "when": function (answers)
    {
      return answers.hasMoreDependency;
    }
  },
  {
    "type": "input",
    "name": "version",
    "message": "Range operator (>>, >=, =, <= or <<) with package version (like >= 1.0):",
    "validate": function (value)
    {
      var rangeRegex = /((<[<=]|>[>=])|=)/;
      var regex = new RegExp ('^' + rangeRegex.source + '[ ]{1}' + versionRegex.source + '$');
      return regex.test (value);
    },
    "when": function (answers)
    {
      return answers.hasMoreDependency;
    }
  }
];