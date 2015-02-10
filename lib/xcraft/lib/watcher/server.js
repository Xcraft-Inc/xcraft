#!/usr/bin/env node
'use strict';

var fs      = require ('fs');
var path    = require ('path');
var watcher = require ('tree-watcher');
var spawn   = require ('../spawn.js');

var lib = path.resolve ('./lib/');
var xcraftRoot = process.cwd ();

var watcher = new watcher.Watcher ({
  throttle: 5000
});

watcher.on ('change', function (event, location) {
  var pkg = path.relative (lib, location).split (path.sep)[0];

  if (!fs.existsSync (path.join (lib, pkg, 'package.json'))) {
    return;
  }

  console.log ('begin UPI for ' + pkg);

  var xcraft = path.join (xcraftRoot, 'xcraft');
  spawn.run (xcraft, ['upi', pkg], function (err) {
    if (err) {
      console.log (err);
    } else {
      console.log ('end UPI for ' + pkg);
    }
  });
});

watcher.watch (lib, function (err) {
  if (err) {
    console.error (err);
    process.exit (1);
  }

  console.log ('watcher started');
});

process.on ('SIGTERM', function () {
  watcher.close ();
  console.log ('watcher is shutting down...');
});
