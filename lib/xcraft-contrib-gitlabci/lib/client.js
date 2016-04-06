'use strict';

var request = require ('request');
var util    = require ('util');
var url     = require ('url');


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


function Client (response) {
  if (!(this instanceof Client)) {
    return new Client (response);
  }

  this.response = response;
  this._config = require ('xcraft-core-etc') (null, response).load ('xcraft-contrib-gitlabci');
}

Client.prototype.apiUrl = function () {
  return this._config.url;
};

Client.prototype.updateBuild = function (runner, id, state, trace, callback) {
  var self = this;

  self.response.log.info ('submitting build %d to coordinator...', id);

  var opts = {
    body: {
      state: state,
      trace: trace,
      token: runner.token
    },
    json: true,
    strictSSL: this._config.strictSSL
  };

  self.response.log.info ('update build %d %s', id, state);
  opts.uri = url.resolve (self.apiUrl (), util.format ('ci/api/v1/builds/%d.json', id));

  self.response.log.verb ('put -> %s', opts.uri);
  request.put (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }

    if (res.statusCode === 200) {
      self.response.log.verb ('updated: %s', opts.uri);
      return callback && callback (null, true);
    }

    self.response.log.warn ('update failed: %s', JSON.stringify (body));
    self.response.log.verb ('%d <- %s', res.statusCode, opts.uri);
    return callback && callback (null, false);
  });
};

Client.prototype.registerRunner = function (token, tags, callback) {
  var self = this;

  /* jshint -W106 */
  var opts = {
    body: {
      token:       token,
      description: 'Xcraft runner',
      tag_list:    tags /* jscs:ignore */
    },
    json: true,
    strictSSL: this._config.strictSSL
  };
  /* jshint +W106 */

  opts.uri = url.resolve (self.apiUrl (), 'ci/api/v1/runners/register.json');

  self.response.log.verb ('post -> %s', opts.uri);
  request.post (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }

    if (res.statusCode === 201) {
      self.response.log.verb ('registered: %s', JSON.stringify (body));
      return callback && callback (null, body);
    }

    self.response.log.err ('register failed: %s', JSON.stringify (body));
    self.response.log.verb ('%d <- %s', res.statusCode, opts.uri);
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
    strictSSL: this._config.strictSSL
  };

  opts.uri = url.resolve (self.apiUrl (), 'ci/api/v1/runners/delete');

  self.response.log.verb ('delete -> %s', opts.uri);
  request.del (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }

    if (res.statusCode === 200) {
      self.response.log.verb ('deleted: %s', JSON.stringify (body));
      return callback && callback ();
    }

    self.response.log.err ('delete failed: %s', JSON.stringify (body));
    self.response.log.verb ('%d <- %s', res.statusCode, opts.uri);
    return callback && callback ('bad request, delete runner failed');
  });
};

Client.prototype.getBuild = function (runner, callback) {
  var self = this;

  self.response.log.info ('checking for builds...');

  var opts = {
    body: {
      token: runner.token
    },
    json: true,
    strictSSL: this._config.strictSSL
  };

  opts.uri = url.resolve (self.apiUrl (), 'ci/api/v1/builds/register.json');

  request.post (opts, function (err, res, body) {
    if (err) {
      return callback && callback (err);
    }

    self.response.log.verb ('%d <- %s', res.statusCode, opts.uri);
    self.response.log.verb (JSON.stringify (body));

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
      self.response.log.err ('unable to get builds: forbidden');
      return callback && callback ('unable to get builds');
    }

    self.response.log.info ('no builds found');
    return callback && callback ();
  });
};

module.exports = Client;
