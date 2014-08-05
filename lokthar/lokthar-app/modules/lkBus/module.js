///LoKthar Bus Module
//
var module        = angular.module('lk-bus', []);
var zogConfig     = require ('../../scripts/zogConfig.js')();

module.factory ('commandBus', function(){
    var axon      = require('axon');
    var commands  = axon.socket('push');
    commands.connect (parseInt(zogConfig.bus.commanderPort), zogConfig.bus.host);
    return commands;
});

module.factory ('notificationBus', function(){
    var axon          = require('axon');
    var notifications = axon.socket ('sub');
    notifications.connect (parseInt (zogConfig.bus.notifierPort), zogConfig.bus.host);
    return notifications;
});
