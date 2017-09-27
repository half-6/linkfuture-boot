"use strict";
/**
 * Module Name: config
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $debugger = require('debug')("lf-boot");
const $path = require('path');
const _ = require("lodash");
const $util = require('./util');
const $root = require('app-root-path').toString();
const constants = {
    KEY_DEV : 'dev'
    ,KEY_PROD : 'prod'
};
const $defaultMeta = {
    "root":$root,
    "resourceroot":$path.join($root,`src/resource/`),
    "webroot":$path.join($root,`src/webapp/`)
};
module.exports = (meta)=>
{
    process.env.NODE_ENV = (process.env.NODE_ENV || constants.KEY_DEV).trim();
    $debugger(`Reading config as ${process.env.NODE_ENV } environment`);
    meta = _.merge({},$defaultMeta,meta);
    //read default config
    let config = $util.readJson(`${meta.resourceroot}config.json`);
    //read env config
    config = _.merge(config,$util.readJson(`${meta.resourceroot}config.${process.env.NODE_ENV}.json`));

    config.debug == $util.isNil(config.debug,process.env.NODE_ENV!=constants.KEY_PROD);

    return {
        constants:constants
        ,config:config
        ,debug: config.debug
        ,webroot:meta.webroot
        ,root:meta.root
        ,resourceroot : meta.resourceroot
    }
};

