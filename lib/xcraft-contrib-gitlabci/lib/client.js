'use strict';

var moduleName = 'gitlabci/client';

var request = require ('request');
var util    = require ('util');
var url     = require ('url');

var xLog   = require ('xcraft-core-log') (moduleName);
var config = require ('xcraft-core-etc').load ('xcraft-contrib-gitlabci');

/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
/* jshint -W106 */
var proxyServer = process.env.HTTPS_PROXY ||
                  process.env.https_proxy ||
                  process.env.HTTP_PROXY  ||
                  process.env.http_proxy;
/* jshint +W106 */
/* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

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

  xLog.info ('update build %d %s', id, state);
  opts.uri = url.resolve (self.apiUrl (), util.format ('/api/v1/builds/%d.json', id));

  xLog.verb ('put -> %s', opts.uri);
  request.put (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }

    if (res.statusCode === 200) {
      xLog.verb ('updated: %s', opts.uri);
      return callback && callback (null, true);
    }

    xLog.warn ('update failed: %s', JSON.stringify (body));
    xLog.verb ('%d <- %s', res.statusCode, opts.uri);
    return callback && callback (null, false);
  });
};

Client.prototype.registerRunner = function (token, tags, callback) {
  var self = this;

  var xPlatform = require ('xcraft-core-platform');

  /* jshint -W106 */
  var opts = {
    body: {
      token:       token,
      description: 'Xcraft runner',
      tag_list:    tags
    },
    json: true,
    strictSSL: config.strictSSL
  };
  /* jshint +W106 */

  opts.uri = url.resolve (self.apiUrl (), '/api/v1/runners/register.json');

  xLog.verb ('post -> %s', opts.uri);
  request.post (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }

    if (res.statusCode === 201) {
      xLog.verb ('registered: %s', JSON.stringify (body));
      return callback && callback (null, body);
    }

    xLog.err ('register failed: %s', JSON.stringify (body));
    xLog.verb ('%d <- %s', res.statusCode, opts.uri);
    return callback && callback ('bad request, registration failed');
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

  xLog.verb ('delete -> %s', opts.uri);
  request.del (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }

    if (res.statusCode === 200) {
      xLog.verb ('deleted: %s', JSON.stringify (body));
      return callback && callback ();
    }

    xLog.err ('delete failed: %s', JSON.stringify (body));
    xLog.verb ('%d <- %s', res.statusCode, opts.uri);
    return callback && callback ('bad request, delete runner failed');
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

    xLog.verb ('%d <- %s', res.statusCode, opts.uri);
    xLog.verb (JSON.stringify (body));

    if (res.statusCode === 201) {
      /* Keep only the useful rows. */
      var commands = body.commands
        .replace (/\r/g, '')
        .split ('\n')
        .filter (function (n) {
          return n.length > 0;
        });

      /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
      /* jshint -W106 */
      var o = {
        id:            body.id,
        commands:      commands,
        ref:           body.ref,
        sha:           body.sha,
        projectId:     body.project_id,
        repoUrl:       body.repo_url,
        beforeSha:     body.before_sha,
        timeout:       body.timeout,
        allowGitFetch: body.allow_git_fetch,
        projectName:   body.project_name,
        variables:     body.variables /* array of objects {key: '', value: ''} */
      };
      /* jshint +W106 */
      /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
      return callback && callback (null, o);
    }

    if (res.statusCode === 403) {
      xLog.err ('unable to get builds: forbidden');
      return callback && callback ('unable to get builds');
    }

    xLog.info ('no builds found');
    return callback && callback ();
  });
};

module.exports = Client;
