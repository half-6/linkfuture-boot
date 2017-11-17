'use strict';
/**
 * Module Name: config api
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */
const $passport = require('passport');
const $basicStrategy = require('passport-http').BasicStrategy;
const _ = require('lodash');
const $config = $lf.$config;
const $defaultMeta = {
  username: 'admin',
  password: 'qwer1234'
};
const $meta = _.get($config, 'config.lf_admin', $defaultMeta);
module.exports = app => {
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
  app.get(
    '/api/config',
    $passport.authenticate('basic', { session: false }),
    $lf.$md({ api: true }),
    (req, res, next) => {
      res.json({
        config: $config.config,
        env: process.env
      });
    }
  );
};
