'use strict';

const watt = require('gigawatts');
const DebHttp = require('./debHttp.js');

let debHttp = null;
exports.debHttp = function () {
  const repositorConfig = require('xcraft-core-etc')().load('goblin-repositor');

  if (!repositorConfig?.http?.enabled) {
    return null;
  }

  debHttp = new DebHttp(
    repositorConfig?.http?.port,
    repositorConfig?.http?.hostname
  );
  return debHttp;
};

exports.dispose = watt(function* () {
  if (debHttp) {
    yield debHttp.dispose();
  }
});
