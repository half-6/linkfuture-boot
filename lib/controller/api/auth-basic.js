'use strict';
/**
 * Module Name: auth0
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */
const $passport = require('passport');
const $basicStrategy = require('passport-http').BasicStrategy;
const $assert = require('assert');
/*
   meta = {
      "username":"admin",
      "password":"qwer123",
      "method":"basic"
   }
*/
/**
 build auth
 @param app express app
 */
module.exports = app => {
  const $meta = $lf.$auth.$meta;
  $assert($meta, 'missing auth setting');
  // This will configure Passport to use Auth0
  $passport.use(
    new $basicStrategy((username, password, done) => {
      if (
        username.valueOf() === $meta.username &&
        password.valueOf() === $meta.password
      )
        return done(null, true);
      else return done(null, false);
    })
  );
  app.use((req, res, next) => {
    const mapping = $lf.$auth.isUrlMatch(req.url, req.method);
    if (mapping) {
      $passport.authenticate('basic', { session: false })(req, res, next);
    }
  });
};
