"use strict";
/**
 * Module Name: index
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $debugger = require('debug')("lf-boot");
const $express = require('express');
const $morgan = require('morgan');
const $cookieParser = require('cookie-parser');
const $bodyParser = require('body-parser');
const $helmet = require('helmet');
const $compression  = require('compression');


module.exports =  (meta)=> {
    $debugger("Start LinkFuture Boot");
    //global $lf injection
    global.$lf = global.$lf || {};
    global.$lf.$util = require("./utility/util");
    //must init config first
    global.$lf.$config = require("./utility/config")(meta);
    global.$lf.$logger = require("./utility/logger");

    global.$lf.$cache = require("./utility/cache");
    global.$lf.$auth = require("./utility/auth");
    global.$lf.$siteInfo = require("./utility/siteinfo");
    global.$lf._ = require("lodash");
    global.$lf.$m = require("moment");

    //you should use $lf. after above injection
    //init auth model
    global.$lf.$md = require("./service/middleware");

    const $app = $express();
    setupApp();
    $lf.$logger.silly("Init LinkFuture Boot Success,you can access utility at global.$lf");
    // process.on("unhandledRejection", function(reason, p){
    //     $lf.$logger.error("unhandledRejection", reason, p);
    // });
    function boot() {
        require("./controller/page/errorPage")($app);
        require("./utility/www")($app);
    }
    function setupApp() {
        $app.use($morgan("dev",{stream:{write:(msg)=>{$lf.$logger.silly(msg.replace("\n",""));}}}));
        $app.use($helmet($lf.$config.config.helmet));
        $app.use($compression());
        $app.use($bodyParser.json());
        $app.use($bodyParser.urlencoded({ extended: false }));
        $app.use($cookieParser());
        $app.use($express.static($lf.$config.webroot));
        if($lf.$auth.$meta.method)
        {
            $lf.$auth.init($app);
            require(`./controller/api/auth-${$lf.$auth.$meta.method}`)($app);
        }
        require("./controller/global.controller")($app);
        require("./controller/api/config")($app);
    }

    return {
        boot,
        app:$app
    };
};