'use strict';

var clc            = require ('cli-color');
var reflux         = require ('reflux');
var activityStore  = reflux.createStore (require ('../stores/activitystore.js'));


function printList (list) {
  const keys = Object.keys (list);
  keys.forEach (function (id) {
    const orc = list[id].orc;
    const cmd = list[id].cmd;
    const al1 = new Array (20 - orc.length).join (' ');
    const al2 = new Array (20 - id.length).join (' ');
    console.log (` ${clc.blackBright ('°')} ${orc}${al1}${id}${al2}${cmd}`);
  });
  if (!keys.length) {
    console.log (` ${clc.blackBright ('°')} N/A`);
  }
}

module.exports = function () {
  activityStore.listen (function (status) {
    console.log ();
    console.log (clc.yellow (' Waiting'));

    printList (status.waiting);

    console.log ();
    console.log (clc.green (' Running'));

    printList (status.running);

    console.log ();
  });
};
