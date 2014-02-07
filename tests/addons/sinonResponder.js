/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'tests/addons/sinon'
], function (Sinon) {

  return {
    useFakeXMLHttpRequest: Sinon.useFakeXMLHttpRequest,

    makeMockResponder: function (requests) {
      var self = this;
      var requestIndex = 0;
      var responseTime = 10;

      // we need to check if IE for slower Sinon responses
      if (typeof navigator !== 'undefined' && navigator.appName === 'Microsoft Internet Explorer') {
        responseTime = 200;
      }

      return function (returnValue, response) {
        setTimeout(function () {
          self.respond(requests[requestIndex++], response);
        }, responseTime);

        return returnValue;
      }
    },
    respond: function (req, mock) {
      if (typeof mock === 'undefined') {
        console.log('Mock does not exist!');
      }
      if (req && req.respond) {
        if (mock.status >= 400) {
          req.abort(mock.status, mock.headers, mock.body);
        } else {
          req.respond(mock.status, mock.headers, mock.body);
        }
      }
    }
  }
});
