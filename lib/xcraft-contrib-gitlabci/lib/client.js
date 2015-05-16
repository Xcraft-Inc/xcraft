'use strict';

var moduleName = 'gilabci-client';

var xLog    = require ('xcraft-core-log') (moduleName);
var config  = require ('xcraft-core-etc').load ('xcraft-contrib-gitlabci');
var request = require ('request');
var util    = require ('util');
var url     = require ('url');

var proxyServer = process.env.HTTPS_PROXY ||
                  process.env.https_proxy ||
                  process.env.HTTP_PROXY  ||
                  process.env.http_proxy;

if (proxyServer) {
  request = request.defaults ({proxy: proxyServer});
}


function Client () {
  if (!(this instanceof Client)) {
    return new Client ();
  }
}

Client.prototype.apiUrl = function () {
  return config.url;
};

Client.prototype.updateBuild = function (runner, id, state, trace, callback) {
  var self = this;

  xLog.info ('submitting build %d to coordinator...', id);

  var opts = {
    body: {
      state: state,
      trace: trace,
      token: runner.token
    },
    json: true,
    strictSSL: config.strictSSL
  };

  xLog.info ('update build', id, state);
  opts.uri = url.resolve (self.apiUrl (), util.format ('/api/v1/builds/%d.json', id));

  xLog.verb ('PUT -> ', opts.uri);
  request.put (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }
    if (res.statusCode === 200) {
      xLog.verb ('OK <- ', opts.uri);
      return callback && callback (null, true);
    } else {
      xLog.verb ('NOT OK <- ', body);
      xLog.verb (res.statusCode, opts.uri);
      return callback && callback (null, false);
    }
  });
};

Client.prototype.registerRunner = function (token, callback) {
  var self = this;

  var opts = {
    body: {
      token: token
    },
    json: true,
    strictSSL: config.strictSSL
  };

  opts.uri = url.resolve (self.apiUrl (), '/api/v1/runners/register.json');

  xLog.verb ('POST -> ', opts.uri);
  request.post (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }
    if (res.statusCode === 201) {
      xLog.verb ('REGISTERED <- ', body);
      return callback && callback (null, body);
    } else {
      xLog.verb (res.statusCode, ' <- ', opts.uri);
      xLog.err ('register runner failed', body);
      return callback && callback ('bad request, registration failed');
    }
  });
};

Client.prototype.deleteRunner = function (runner, callback) {
  var self = this;

  var opts = {
    body: {
      token: runner.token
    },
    json: true,
    strictSSL: config.strictSSL
  };

  opts.uri = url.resolve (self.apiUrl (), '/api/v1/runners/delete');

  xLog.verb ('DELETE -> ', opts.uri);
  request.del (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }
    if (res.statusCode === 200) {
      xLog.verb ('DELETED <- ', body);
      return callback && callback (null, body);
    } else {
      xLog.verb (res.statusCode, ' <- ', opts.uri);
      xLog.err ('delete runner failed', body);
      return callback && callback ('bad request, delete runner failed');
    }
  });
};

Client.prototype.getBuild = function (runner, callback) {
  var self = this;

  xLog.info ('checking for builds...');

  var opts = {
    body: {
      token: runner.token
    },
    json: true,
    strictSSL: config.strictSSL
  };

  opts.uri = url.resolve (self.apiUrl (), '/api/v1/builds/register.json');

  request.post (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }

    xLog.verb (res.statusCode, ' <- ', opts.uri);

    if (res.statusCode === 201) {
      var o = {
        id: body.id,
        project_id: body.project_id,
        commands: body.commands.replace(/\r\n/g, '\n').split('\n'),
        repo_url: body.repo_url,
        ref: body.sha,
        ref_name: body.before_sha,
        allow_git_fetch: body.allow_git_fetch,
        timeout: body.timeout
      };
      return callback && callback (null, o);
    } else if (res.statusCode === 403) {
      xLog.err ('Unable to get builds', 'forbidden');
      return callback && callback ('Unable to get builds');
    } else {
      xLog.info ('no builds found');
      return callback && callback ();
    }
  });
};

module.exports = Client;
