#!/usr/bin/env node

var moduleName = 'peon';

var fs      = require ('fs');
var url     = require ('url');
var zogHttp = require ('zogHttp');

var config = require ('./config.json');
var urlObj = url.parse (config.uri);

if (/http[s]+:/.test (urlObj.protocol))
{
  var outputFile = path.join (__dirname, 'cache', urlObj.pathname);
  zogHttp.get (config.uri, outputFile);
}
