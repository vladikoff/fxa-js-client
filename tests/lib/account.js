/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'tests/addons/environment'
], function (tdd, assert, Environment) {

  with (tdd) {
    suite('account', function () {
       var accountHelper;
       var respond;
       var mail;
       var client;
       var RequestMocks;
       var ErrorMocks;

      beforeEach(function () {
        var env = new Environment();
        accountHelper = env.accountHelper;
        respond = env.respond;
        mail = env.mail;
        client = env.client;
        RequestMocks = env.RequestMocks;
        ErrorMocks = env.ErrorMocks;
      });

      test('#destroy', function () {
        var email;
        var password;

        return accountHelper.newVerifiedAccount()
          .then(function (account) {
            email = account.input.email;
            password = account.input.password;

            return respond(client.accountDestroy(email, password), RequestMocks.accountDestroy)
          })
          .then(
            function(res) {
              assert.ok(res, 'got response');

              return respond(client.signIn(email, password), ErrorMocks.accountDoesNotExist)
            }
          ).then(
            function (res) {
              assert.isNull(res);
            },
            function (error) {
              assert.ok(error);
              assert.equal(error.errno, 102, 'Account is gone');
              assert.equal(error.code, 400, 'Correct status code');
            }
        );
      });

      test('#keys', function () {

        return accountHelper.newVerifiedAccount()
          .then(function (account) {

            return respond(client.accountKeys(account.signIn.keyFetchToken), RequestMocks.accountKeys)
          })
          .then(
            function(keys) {
              assert.ok(keys.bundle);
            },
            function(error) {
              assert.isNull(error);
            }
          );
      });

      test('#destroy with incorrect case', function () {
        var account;

        return accountHelper.newVerifiedAccount()
          .then(function (acc) {
            account = acc;
            var incorrectCaseEmail = account.input.email.charAt(0).toUpperCase() + account.input.email.slice(1);

            return respond(client.accountDestroy(incorrectCaseEmail, account.input.password), RequestMocks.accountDestroy)
          })
          .then(
          function(res) {
            assert.ok(res, '== got response');

            return respond(client.signIn(account.input.email, account.input.password), ErrorMocks.accountDoesNotExist)
          }
        ).then(
          function (res) {
            assert.isNull(res);
          },
          function (error) {
            assert.ok(error);
            assert.equal(error.errno, 102);
            assert.equal(error.code, 400, 'Correct status code');
          }
        );
      });

      /**
       * Password Reset
       */
      test('#reset password', function () {
        var user = 'test5' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;
        var passwordForgotToken;
        var accountResetToken;

        return respond(client.signUp(email, password), RequestMocks.signUp)
          .then(function (result) {
            uid = result.uid;
            assert.ok(uid, "uid is returned");

            return respond(client.passwordForgotSendCode(email), RequestMocks.passwordForgotSendCode);
          })
          .then(function (result) {
            passwordForgotToken = result.passwordForgotToken;
            assert.ok(passwordForgotToken, "passwordForgotToken is returned");

            return respond(mail.wait(user, 2), RequestMocks.resetMail);
          })
          .then(function (emails) {
            var code = emails[1].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, "code is returned: " + code);

            return respond(client.passwordForgotVerifyCode(code, passwordForgotToken), RequestMocks.passwordForgotVerifyCode);
          })
          .then(function (result) {
            accountResetToken = result.accountResetToken;
            var newPassword = 'newturles';
            assert.ok(accountResetToken, "accountResetToken is returned");

            return respond(client.accountReset(email, newPassword, accountResetToken), RequestMocks.accountReset);
          })
          .then(
            function (result) {
              assert.isNotNull(result);
            },
            function(err) {
              assert.isNull(err);
            }
          )
      });

    });
  }
});
