"use strict";
/**
 * Module Name: auth
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $logger = require('./logger');
const $util = require('./util');
const $cache = require('./cache');
const $jwt = require('jsonwebtoken');
const $fs = require('fs');
const $url = require('url');
const $assert = require('assert');
const _ = require('lodash');
const LOGIN_METHOD = {
    "form":"form",
    "auth0":"auth0"
};

const $defaultMeta = {
    "login":"/login",
    "logout":"/logout",
    "loginSuccessURL": "/admin",
    "logoutSuccessURL": "/",
    "cookieOptions":{  //optional
        "httpOnly": true,
        //"cookieAge": 7200000, // 2hr no need, as JWT will expired
        "secure":true,
        "expires": 0 //browser session only cookie
    },
};
const $meta = _.merge({},$defaultMeta,_.get($lf.$config,"config.auth"));
$assert($meta,"missing auth setting");
const COOKIE_KEY = "LF_AUTH";
const AUTH_HEADER = "authorization";
const DEFAULT_AUTH_SCHEME = "JWT";

function init(app) {
    app.use((req, res, next)=>{
        $logger.silly("init auth model for request");
        let token = cookieExtractor(req) || headerExtractor(req);
        req.user = token ? decode(token) : null;
        req.isAuthenticated = function () {
            return req.user != null;
        };
        req.logout = function () {
            req.user = null;
            res.cookie(COOKIE_KEY, "", {expires: new Date()});
        };
        next();
    })
}

function cookieExtractor(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies[COOKIE_KEY];
    }
    return token;
}

function headerExtractor(req) {
    let token = null;
    if (req && req.headers && req.headers[AUTH_HEADER]) {
        let auth_params = $util.parseHeader(req.headers[AUTH_HEADER]);
        if (auth_params && DEFAULT_AUTH_SCHEME === auth_params.scheme) {
            token = auth_params.value;
        }
    }
    return token;
}

function authenticate(res, user) {
    $logger.silly("authenticate user and write JWT token cookie");
    let jwt = encode(user);
    res.cookie(COOKIE_KEY, jwt, $meta.cookieOptions);
    return jwt;
}

function encode(obj, exp) {
    $logger.silly("generated JWT token =>" + JSON.stringify(obj));
    let options = $meta.jwt.options;
    if (exp) {
        options = Object.assign(options,
            {
                expiresIn: exp, /*seconds or string like 1m,1h,7d*/
            }
        );
    }
    let privateKey = $cache.local.upsert("$jwt_private_key",()=>{
        return $fs.readFileSync($meta.jwt.secret.private, 'utf8');
    });
    return $jwt.sign(obj, privateKey, options)
}

function decode(token) {
    try {
        let publicKey = $cache.local.upsert("$jwt_public_key",()=>{
            return $fs.readFileSync($meta.jwt.secret.public, 'utf8');
        });
        return $jwt.verify(token, publicKey, $meta.jwt.options);
    }
    catch (err) {
        $logger.error("jwt decode exception", err);
        return null;
    }
}

function getLoginUrl(returnUrl) {
    return $meta.login + $url.format({query:{"return":returnUrl}})
}

function hasAccess(req,requiredRoles) {
    if(!req.isAuthenticated())
    {
        return false;
    }
    if(!requiredRoles || requiredRoles.length == 0)
    {
        return true;
    }
    if(!req.user.roles){
        return false;
    }
    let roles = _.isArray(req.user.roles)?req.user.roles:[req.user.roles];
    return requiredRoles.some(r=>roles.indexOf(r)>=0);
}

function isUrlMatch(url,httpMethod) {
    const $securityMapping = $meta.mappings;
    if($securityMapping)
    {
        for (let i in $securityMapping.mappings) {
            let mapping = $securityMapping.mappings[i];
            if (new RegExp(mapping.pattern).exec(url) && (!httpMethod || !mapping.method || mapping.method.indexOf(httpMethod)>=0)) {
                return mapping;
            }
        }
    }
    return undefined;
}

// check auth in the config.json
module.exports = {
    init,
    isUrlMatch,
    hasAccess,
    authenticate,
    encode,
    decode,
    getLoginUrl,
    $meta,
    LOGIN_METHOD
};