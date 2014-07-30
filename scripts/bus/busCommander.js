//Command Bus Service
'use strict';

var moduleName = 'command-bus';
var zogConfig = require ('../zogConfig.js') ();
var zogLog    = require ('zogLog') (moduleName);
var async     = require('async');
var axon      = require('axon');
