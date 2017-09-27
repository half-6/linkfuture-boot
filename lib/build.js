"use strict";
/**
 * Module Name: index
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $debugger = require('debug')("lf-boot");
const $minify = require('./build/minify');

module.exports =  (meta)=> {
    $debugger("Start LinkFuture Build");
    global.$lf = global.$lf || {};
    //global $lf injection
    global.$lf.$util = require("./utility/util");
    //must init config first
    global.$lf.$config = require("./utility/config")(meta);
    global.$lf.$logger = require("./utility/logger");
    return {
        build,
        buildJS,
        buildCSS,
        buildAPI,
        buildSQL
    }
};

async function buildJS() {
    $lf.$logger.warn("*********** Start build JS *************");
    await $minify.build($lf.$config.config.static.jsBuildFile,$minify.buildType.js);
    $lf.$logger.warn("*********** End build JS *************");
}
async function buildCSS() {
    $lf.$logger.warn("*********** Start build CSS *************");
    await $minify.build($lf.$config.config.static.cssBuildFile,$minify.buildType.css);
    $lf.$logger.warn("*********** End build CSS *************");
}

async function buildAPI() {
    $lf.$logger.warn("*********** Start build API Doc *************");
    var execAsync = Promise.promisify(require('child_process').exec);
    const cmd = "apidoc -i src/bin/controller/api/ -o src/webapp/doc";
    await execAsync(cmd);
    $lf.$logger.warn("*********** End build API *************");
}
async function buildSQL() {
    $lf.$logger.warn("*********** Start build SQL *************");
    await $minify.build($lf.$config.config.static.sqlBuildFile,$minify.buildType.sql);
    $lf.$logger.warn("*********** End build SQL *************");
}

async function build(input) {
    if(!input || input.length == 0)
    {
        await buildJS();
        await buildCSS();
        await buildAPI();
        await buildSQL();
    }
    input = $lf.$util.arrayToUpperCase(input);
    if(input.indexOf("JS")>=0) await buildJS();
    if(input.indexOf("CSS")>=0) await buildCSS();
    if(input.indexOf("API")>=0) await buildAPI();
    if(input.indexOf("SQL")>=0) await buildSQL();
}


//apidoc
// async function buildAPIDoc() {
//     $lf.$logger.warn("*********** Start build API Doc *************");
//     const exec = require('child_process').exec
//     const cmd = "apidoc -i src/bin/controller/api/ -o src/webapp/doc";
//     exec(cmd, function(error, stdout, stderr) {
//         if(error)
//         {
//             throw error;
//         }
//         if(stdout)
//         {
//             console.info(stdout);
//         }
//         // command output is in stdout
//         $lf.$logger.warn("*********** End build API *************");
//     });
//
// }


