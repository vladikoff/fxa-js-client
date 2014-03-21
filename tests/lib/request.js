/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment',
  'client/lib/request',
  'tests/mocks/request'
], function (tdd, assert, Environment, Request, RequestMocks) {
  with (tdd) {
    suite('request module', function () {
      var env;
      var respond;
      var client;
      var RequestMocks;
      var request;

      beforeEach(function () {
        env = new Environment();
        respond = env.respond;
        client = env.client;
        RequestMocks = env.RequestMocks;
        request = new Request(env.authServerUrl, env.xhr);

        console.log(env.authServerUrl);
      });

      test('#heartbeat', function () {
        var heartbeatRequest = request.send("/__heartbeat__", "GET")
          .then(
            function (res) {
              assert.ok(res);
            },
            function (err) {
              throw err;
            }
          );
        env.respond(env.requests[0], RequestMocks.heartbeat);
        return heartbeatRequest;
      });

      test('#unreachable', function () {
        var request = new Request('http://127.0.0.1:81/', env.xhr);
        var heartbeatRequest = env.respond(request.send("/unreachable", "GET"), RequestMocks.heartbeat)
          .then(
            function (res) {
              console.log(res);
              assert.equal(res, '{}');
            },
            function (err) {
              throw err;
            }
          );

        return heartbeatRequest;
      });
    });
  }
});
