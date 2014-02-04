/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/intern',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest',
  'tests/addons/sinonResponder',
  'client/FxAccountClient',
  'tests/addons/restmail',
  'tests/addons/accountHelper',
  'tests/mocks/request',
  'tests/mocks/errors'
], function (config, XHR, SinonResponder, FxAccountClient, Restmail, AccountHelper, RequestMocks, ErrorMocks) {

  function Environment() {
    var self = this;
    this.authServerUrl = config.AUTH_SERVER_URL || 'http://127.0.0.1:9000/v1';
    this.useRemoteServer = !!config.AUTH_SERVER_URL;
    this.mailServerUrl = this.authServerUrl.match(/^http:\/\/127/) ?
      'http://127.0.0.1:9001' :
      'http://restmail.net';

    if (this.useRemoteServer) {
      this.xhr = XHR.XMLHttpRequest;
      this.respond = noop;
    } else {
      this.requests = [];
      this.xhr = SinonResponder.useFakeXMLHttpRequest();
      this.xhr.onCreate = function (xhr) {
        self.requests.push(xhr);
      };
      this.respond = SinonResponder.makeMockResponder(this.requests);
    }
    this.client = new FxAccountClient(this.authServerUrl, { xhr: this.xhr });
    this.mail = new Restmail(this.mailServerUrl, this.xhr);
    this.accountHelper = new AccountHelper(this.client, this.mail, this.respond);
    this.ErrorMocks = ErrorMocks;
    this.RequestMocks = RequestMocks;
  }

  function noop(val) { return val; }

  return Environment;
});
