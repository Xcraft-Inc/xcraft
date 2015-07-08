'use strict';

var should = require ('should'); /* jshint ignore:line */
var xUtils = require ('../index.js');

describe ('xcraft-core-utils', function () {
  describe ('#topic2Action ()', function () {
    var topics = [{
      in:  '',
      out: ''
    }, {
      in:  'foo.bar',
      out: 'fooBar'
    }, {
      in:  'fooBar',
      out: 'fooBar'
    }, {
      in:  'f.o.o.b.a.r',
      out: 'fOOBAR'
    }, {
      in:  'fo.ob.ar',
      out: 'foObAr'
    }];

    topics.forEach (function (item) {
      it ('camelcasify ' + item.in, function () {
        xUtils.topic2Action (item.in).should.be.equal (item.out);
      });
    });
  });

  describe ('#string#capitalize ()', function () {
    var strings = [{
      in:  '',
      out: ''
    }, {
      in:  'foobar',
      out: 'Foobar'
    }, {
      in:  'FOOBAR',
      out: 'Foobar'
    }, {
      in:  'fOOBAR',
      out: 'Foobar'
    }, {
      in:  'Foobar',
      out: 'Foobar'
    }];

    strings.forEach (function (str) {
      it ('capitalize ' + str.in, function () {
        xUtils.string.capitalize (str.in).should.be.equal (str.out);
      });
    });
  });
});
