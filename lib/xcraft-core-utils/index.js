'use strict';

var fs     = require ('fs');
var crypto = require ('crypto');

exports.yamlFile2Json = function (yamlFile) {
  var yaml = require ('js-yaml');

  var data = fs.readFileSync (yamlFile, 'utf8');
  return yaml.safeLoad (data);
};

exports.jsonFile2Json = function (jsonFile) {
  var data = fs.readFileSync (jsonFile, 'utf8');
  return JSON.parse (data);
};

exports.json2JsonFile = function (json, destFile) {
  fs.writeFileSync (destFile, JSON.stringify (json), 'utf8');
};

exports.topic2Action = function (topic) {
  return topic.replace (/(\.[a-z])/g, function (match) {
    return match.replace ('.', '').toUpperCase ();
  });
};

exports.md5 = function (data) {
  var md5 = crypto.createHash ('md5');
  md5.update (data);
  return md5.digest ('hex');
};

exports.generateToken = function (callback) {
  var createKey = function (key) {
    var shasum = crypto.createHash ('sha1');
    shasum.update (key);
    return shasum.digest ('hex');
  };

  var buf = null;

  try {
    buf = crypto.randomBytes (256);
    callback (null, createKey (buf));
  } catch (ex) {
    /* Handle error.
     * Most likely, entropy sources are drained.
     */
    crypto.pseudoRandomBytes (256, function (ex, buf) {
      if (ex) {
        throw ex;
      }

      callback (null, createKey (buf));
    });
  }
};
