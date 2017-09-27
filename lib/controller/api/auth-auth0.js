/**
 * Module Name:
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */

const $passport = require('passport');
const $strategy = require('passport-auth0');
const $url = require('url');
const $assert = require('assert');
const KEY_RETURN_TO = "return";
const _ = require('lodash');

const $meta = $lf.$auth.$meta;
$assert($meta,"missing auth setting");
const $defaultMeta = {
    "callbackURL":"/callback",
    "successURL":$meta.loginSuccessURL
};
const $auth0Meta = _.merge({},$defaultMeta,$meta.auth0);
$assert($meta.auth0,"missing auth0 setting");

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
    //noinspection JSUnresolvedVariable
    const strategy = new $strategy($auth0Meta,
        function(accessToken, refreshToken, extraParams, profile, done) {
            // accessToken is the token to call Auth0 API (not needed in the most cases)
            // extraParams.id_token has the JSON Web Token
            // profile has all the information from the user
            return done(null, profile);
        }
    );
    $passport.use(strategy);
    // you can use this section to keep a smaller payload
    //noinspection JSUnresolvedFunction
    $passport.serializeUser(function(user, done) {
        done(null, user);
    });
    //noinspection JSUnresolvedFunction
    $passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    //noinspection JSUnresolvedFunction
    app.use($passport.initialize());
    //noinspection JSUnresolvedFunction
    app.use($passport.session());
    //app.use($express.session({ cookie: { maxAge: 60000 }}));
    app.get($meta.login,
        (req, res,next)=>{
            //build callback URL
            let returnURL = req.query[KEY_RETURN_TO];

            //noinspection JSUnresolvedVariable
            let callbackURL = $auth0Meta.callbackURL;
            if(returnURL && returnURL.indexOf("http")<0)
            {
                let options = {pathname:callbackURL,query:{}};
                options.query[KEY_RETURN_TO] = returnURL;
                callbackURL = $url.format(options)
            }
            $lf.$logger.silly(`callback url is ${callbackURL}`);
            $passport.authenticate('auth0',{callbackURL:callbackURL})(req, res,next);
        },
        function(err,req, res) {
            //noinspection JSUnresolvedVariable
            res.redirect($auth0Meta.successURL);
        }
    );

    app.get($meta.logout, function(req, res) {
        $lf.$logger.silly("auth0 logout");
        req.logout();
        res.redirect($meta.logoutSuccessURL);
    });

    app.get($auth0Meta.callbackURL,
        (req, res,next)=>{
            //noinspection JSUnresolvedVariable
            if (req && req.query && req.query.error && req.query.error_description) {
                //noinspection JSUnresolvedVariable
                $lf.$logger.silly(`auth0 failed with ${req.query.error}, ${req.query.error_description}`);
                req.logout();
                let err = new Error(req.query.error);
                //noinspection JSUnresolvedVariable
                err.description = req.query.error_description;
                throw err;
            }
            next();
        },
        $passport.authenticate('auth0'),
        (req, res)=>{
            $lf.$logger.silly("auth0 callback success");
            req.user = req.user["_json"] || req.user;
            delete req.user["sub"];
            $lf.$auth.authenticate(res,req.user);
            //noinspection JSUnresolvedVariable
            res.redirect(req.query[KEY_RETURN_TO] || $auth0Meta.successURL);
        }
    );
};

