"use strict";
/**
 * Module Name: siteinfo
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $path = require('path');
const _ = require("lodash");
const $assert = require('assert');
const $fs = require('fs');
const $cache = require('./cache');
const $logger = require('./logger');
const $glob = require('glob-promise');
const $util = require('./util');

const $JS_Reference_Template = '<script src="{file_URL}"></script>';
const $CSS_Reference_Template = '<link href="{file_URL}" rel="stylesheet">';
const $config = $lf.$config;
const $defaultMeta = {
    "minify":false,
    "jsFolder": "src/webapp/static/js/",
    "cssFolder": "src/webapp/static/css/",
    "jsHttp": "/static/js/",
    "cssHttp": "/static/css/",
    "jsBuildFile":"./src/webapp/static/js/build.json",
    "cssBuildFile":"./src/webapp/static/css/build.json",
};

const $meta = _.merge({},$defaultMeta,_.get($lf.$config,"config.static"));
$assert($meta,"missing static setting");

function getJsBuild() {
    return $cache.local.upsert("jsBuildFile",()=>{
        return  $util.readJson($meta.jsBuildFile);
    });
}
function getCssBuild() {
    return $cache.local.upsert("cssBuildFile",()=>{
        return  $util.readJson($meta.cssBuildFile);
    });
}

function buildJSFiles(name) {
    let $jsBuild = getJsBuild();
    return $cache.local.upsert("JS-Reference-Files-" + name + "-" +$meta.minify,function () {
        if($jsBuild[name])
        {
            $logger.info("build inline js reference",name);
            const config = $jsBuild[name];
            return findFiles(config,$meta.jsHttp);
        }
        else {
            throw new Error("Specific " + name + " not exist");
        }
    });
}
function findFiles(config,baseUri) {
    let output = [];
    if($meta.minify)
    {
        for(let i in config.files)
        {
            if(config.files[i].indexOf("//")==0)
            {
                output.push(config.files[i]);
            }
        }
        output.push(...buildUri(config.output,baseUri));
    }
    else
    {
        for(let i in config.files)
        {
            output.push(...buildUri(config.files[i],baseUri));
        }
    }
    return output;
}
function buildJSInline(name) {
    return $cache.local.upsert("JS-Reference-Inline-" + name,function () {
        $logger.info("build js inline ",name);
        const files = buildJSFiles(name);
        const output = [];
        for(let i in files)
        {
            output.push("<script language=\"javascript\">");
            output.push(readFile(files[i]));
            output.push("</script>");
        }
        return output.join("");
    });
}
function buildJSReference(name,isUnblock) {
    return $cache.local.upsert("JS-Reference-" + name + "-" + isUnblock,function () {
        $logger.info("build js reference",name);
        const files = buildJSFiles(name, $meta.jsHttp);
        const output = [];
        if(!isUnblock)
        {
            for(let i in files)
            {
                output.push($JS_Reference_Template.replace("{file_URL}",files[i]));
            }
        }
        else
        {
            const unblockFiles = [];
            for(let i in files)
            {
                unblockFiles.push(files[i]);
            }
            output.push("<script language=\"javascript\">$loadJS("+ JSON.stringify(unblockFiles) + ",function() {if (typeof globalInit !== \"undefined\") globalInit();})</script>");
        }
        return output.join("");
    });
}
function buildCSSReference(name) {
    let $cssBuild = getCssBuild();
    return $cache.local.upsert("CSS-Reference-" + name,function () {
        if ($cssBuild[name]) {
            $logger.info("build css reference",name);
            const config = $cssBuild[name];
            const files = findFiles(config, $meta.cssHttp);
            const output = [];
            for (let i in files) {
                output.push($CSS_Reference_Template.replace("{file_URL}", files[i]));
            }
            return output.join("");
        }
        else {
            throw new Error("Specific " + name + " not exist");
        }
    });
}
function buildUri(file,baseUri) {
    if(file.indexOf("//")==0)
    {
        return [file];
    }
    if(file.indexOf("*")>0){
        let findFiles = $glob.sync($path.join($config.webroot,baseUri,file));
        let output = [];
        findFiles.forEach((f)=>{
            output.push(f.substring($config.webroot.length));
        });
        return output;
    }
    return [baseUri + file];
}

function readFile(fileName) {
    return $fs.readFileSync($path.join($config.webroot,fileName), 'utf8')
}

function getApiErrorOutput(res) {
    let output =  {meta: {status:res.statusCode,timestamp:new Date().toISOString().split('T').join(' '),message:res.err.message},response:null};
    if ($config.debug) output.meta.detail = res.err.stack;
    return output;
}
function getApiSuccessOutput(res,body) {
    let response = (typeof body === "string")?JSON.parse(body):body;
    return {meta: {status:res.statusCode,timestamp:new Date().toISOString().split('T').join(' '),message:"success"},response:response};
}
function responseApiErrorOutput(res) {
    return function (err) {
        res.status(400);
        res.err =err;
        res.json(getApiErrorOutput(res));
    }
}
function getIp(req) {
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0];
    if(ip == "::1") ip = "127.0.0.1";
    return ip;
}

module.exports = {
    buildJSReference
    ,buildCSSReference
    ,buildJSInline
    ,buildJSFiles
    ,getApiErrorOutput
    ,getApiSuccessOutput
    ,responseApiErrorOutput
    ,getIp
    ,$meta
};