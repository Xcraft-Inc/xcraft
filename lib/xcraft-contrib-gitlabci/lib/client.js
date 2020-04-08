'use strict';

let request = require('request');

const util = require('util');
const url = require('url');

const proxyServer =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy;

if (proxyServer) {
  request = request.defaults({proxy: proxyServer});
}

function Client(resp) {
  if (!(this instanceof Client)) {
    return new Client(resp);
  }

  this.resp = resp;
  this._config = require('xcraft-core-etc')(null, resp).load(
    'xcraft-contrib-gitlabci'
  );
}

Client.prototype.apiUrl = function () {
  return this._config.url;
};

Client.prototype.updateBuild = function (runner, id, state, trace, callback) {
  const self = this;

  self.resp.log.info('submitting build %d to coordinator...', id);

  const opts = {
    body: {
      state: state,
      trace: trace,
      token: runner.token,
    },
    json: true,
    strictSSL: this._config.strictSSL,
  };

  self.resp.log.info('update build %d %s', id, state);
  opts.uri = url.resolve(
    self.apiUrl(),
    util.format('ci/api/v1/builds/%d.json', id)
  );

  self.resp.log.verb('put -> %s', opts.uri);
  request.put(opts, function (err, res, body) {
    if (err) {
      return callback && callback(err);
    }

    if (res.statusCode === 200) {
      self.resp.log.verb('updated: %s', opts.uri);
      return callback && callback(null, true);
    }

    self.resp.log.warn('update failed: %s', JSON.stringify(body));
    self.resp.log.verb('%d <- %s', res.statusCode, opts.uri);
    return callback && callback(null, false);
  });
};

Client.prototype.registerRunner = function (token, tags, callback) {
  const self = this;

  /* jshint -W106 */
  const opts = {
    body: {
      token: token,
      description: 'Xcraft runner',
      tag_list: tags /* jscs:ignore */,
    },
    json: true,
    strictSSL: this._config.strictSSL,
  };
  /* jshint +W106 */

  opts.uri = url.resolve(self.apiUrl(), 'ci/api/v1/runners/register.json');

  self.resp.log.verb('post -> %s', opts.uri);
  request.post(opts, function (err, res, body) {
    if (err) {
      return callback && callback(err);
    }

    if (res.statusCode === 201) {
      self.resp.log.verb('registered: %s', JSON.stringify(body));
      return callback && callback(null, body);
    }

    self.resp.log.err('register failed: %s', JSON.stringify(body));
    self.resp.log.verb('%d <- %s', res.statusCode, opts.uri);
    return callback && callback('bad request, registration failed');
  });
};

Client.prototype.deleteRunner = function (runner, callback) {
  const self = this;

  const opts = {
    body: {
      token: runner.token,
    },
    json: true,
    strictSSL: this._config.strictSSL,
  };

  opts.uri = url.resolve(self.apiUrl(), 'ci/api/v1/runners/delete');

  self.resp.log.verb('delete -> %s', opts.uri);
  request.del(opts, function (err, res, body) {
    if (err) {
      return callback && callback(err);
    }

    if (res.statusCode === 200) {
      self.resp.log.verb('deleted: %s', JSON.stringify(body));
      return callback && callback();
    }

    self.resp.log.err('delete failed: %s', JSON.stringify(body));
    self.resp.log.verb('%d <- %s', res.statusCode, opts.uri);
    return callback && callback('bad request, delete runner failed');
  });
};

Client.prototype.getBuild = function (runner, callback) {
  const self = this;

  self.resp.log.info('checking for builds...');

  const opts = {
    body: {
      token: runner.token,
    },
    json: true,
    strictSSL: this._config.strictSSL,
  };

  opts.uri = url.resolve(self.apiUrl(), 'ci/api/v1/builds/register.json');

  request.post(opts, function (err, res, body) {
    if (err) {
      return callback && callback(err);
    }

    self.resp.log.verb('%d <- %s', res.statusCode, opts.uri);
    self.resp.log.verb(JSON.stringify(body));

    if (res.statusCode === 201) {
      /* Keep only the useful rows. */
      const commands = body.commands
        .replace(/\r/g, '')
        .split('\n')
        .filter(function (n) {
          return n.length > 0;
        });

      const o = {
        id: body.id,
        commands: commands,
        ref: body.ref,
        sha: body.sha,
        projectId: body.project_id,
        repoUrl: body.repo_url,
        beforeSha: body.before_sha,
        timeout: body.timeout,
        allowGitFetch: body.allow_git_fetch,
        projectName: body.project_name,
        variables: body.variables /* array of objects {key: '', value: ''} */,
      };
      return callback && callback(null, o);
    }

    if (res.statusCode === 403) {
      self.resp.log.err('unable to get builds: forbidden');
      return callback && callback('unable to get builds');
    }

    self.resp.log.info('no builds found');
    return callback && callback();
  });
};

module.exports = Client;
