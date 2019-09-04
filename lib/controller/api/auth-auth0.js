'use strict';
/**
 * Module Name: auth0
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */
const $passport = require('passport');
const $strategy = require('passport-auth0');
const $url = require('url');
const $assert = require('assert');
const KEY_RETURN_TO = 'return';
const _ = require('lodash');

const $meta = $lf.$auth.$meta;
$assert($meta, 'missing auth setting');
const $defaultMeta = {
  callbackURL: '/callback',
  successURL: $meta.loginSuccessURL
};
const $auth0Meta = _.merge({}, $defaultMeta, $meta.auth0);
$assert($meta.auth0, 'missing auth0 setting');

/*
   meta = "auth0": {
       "clientID": "0t1dsFyaYgmEnqdtfit188MhqlGuAluC",
       "domain": "etalogin.auth0.com",
       "clientSecret": "p96yE_KpXllavEifW0Gv3d9_lA9YnjH08y74q_fs2ijJtKAJgBqgMDs2fRRREjqY",
       "responseType": "code",
       "scope": "openid profile",
       "audience": "https://etalogin.auth0.com/userinfo",
       "callbackURL": "/callback"
     }
*/
/**
 build auth
 @param app express app
 */
module.exports = app => {
  // This will configure Passport to use Auth0
  const strategy = new $strategy(
    $auth0Meta,
    // eslint-disable-next-line max-params
    (accessToken, refreshToken, extraParams, profile, done) => {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  );
  $passport.use(strategy);
  // you can use this section to keep a smaller payload
  //noinspection JSUnresolvedFunction
  $passport.serializeUser((user, done) => {
    done(null, user);
  });
  //noinspection JSUnresolvedFunction
  $passport.deserializeUser((user, done) => {
    done(null, user);
  });

  //noinspection JSUnresolvedFunction
  app.use($passport.initialize());
  //noinspection JSUnresolvedFunction
  app.use($passport.session());
  //app.use($express.session({ cookie: { maxAge: 60000 }}));
  app.get(
    $meta.login,
    (req, res, next) => {
      //build callback URL
      const returnURL = req.query[KEY_RETURN_TO];

      //noinspection JSUnresolvedVariable
      let callbackURL = $auth0Meta.callbackURL;
      if (returnURL && returnURL.indexOf('http') < 0) {
        const options = { pathname: callbackURL, query: {} };
        options.query[KEY_RETURN_TO] = returnURL;
        callbackURL = $url.format(options);
      }
      $lf.$logger.silly(`callback url is ${callbackURL}`);
      $passport.authenticate('auth0', {
        callbackURL,
        audience: $auth0Meta.audience
      })(req, res, next);
    },
    (err, req, res) => {
      //noinspection JSUnresolvedVariable
      res.redirect($auth0Meta.successURL);
    }
  );

  app.get($meta.logout, (req, res) => {
    $lf.$logger.silly('auth0 logout');
    req.logout();
    const callbackUrl =
      $meta.logoutSuccessURL.indexOf('://') > 0
        ? $meta.logoutSuccessURL
        : $url.format({
            protocol: req.protocol,
            hostname: req.hostname,
            pathname: $meta.logoutSuccessURL
          });
    const logoutUrl = $url.format({
      protocol: 'https',
      hostname: $auth0Meta.domain,
      pathname: '/v2/logout',
      query: {
        client_id: $auth0Meta.clientID,
        returnTo: callbackUrl
      }
    });
    res.redirect(logoutUrl);
  });

  app.use($meta.info, $lf.$md({ api: true }), (req, res) => {
    $lf.$logger.silly('auth0 info');
    if (req.user) {
      res.json(_.omit(req.user, ['accessToken', 'sub', 'iss', 'aud']));
    } else {
      res.json(undefined);
    }
  });

  app.get(
    $auth0Meta.callbackURL,
    (req, res, next) => {
      //noinspection JSUnresolvedVariable
      if (req && req.query && req.query.error && req.query.error_description) {
        //noinspection JSUnresolvedVariable
        $lf.$logger.silly(
          `auth0 failed with ${req.query.error}, ${req.query.error_description}`
        );
        req.logout();
        const err = new Error(req.query.error);
        //noinspection JSUnresolvedVariable
        err.description = req.query.error_description;
        throw err;
      }
      next();
    },
    $passport.authenticate('auth0'),
    (req, res) => {
      $lf.$logger.silly('auth0 callback success');
      const user_id = _.get(req.user, 'user_id');
      const accessToken = _.get(req.user, 'accessToken');
      req.user = req.user._json || req.user;
      req.user.user_id = user_id;
      req.user.accessToken = accessToken;
      delete req.user.sub;
      $lf.$auth.authenticate(res, req.user);
      //noinspection JSUnresolvedVariable
      res.redirect(req.query[KEY_RETURN_TO] || $auth0Meta.successURL);
    }
  );
};
