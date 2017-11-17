"use strict";
const $express = require('express');
const $util = require('util');
const $logger = require('./logger');
const $cache = require('./cache');
const $config = require('./config');

function bind(settings,isApi=false) {
    var $router = $express.Router();
    /*
    [
        {
            "method":["get","set"]
            ,"url":[urls]
            ,"handler":function(config,req,res,next)   //api: must promise function with result.  page: you need handle response by yourself, no callback expected.
            ,"active":boolean
            ,"cache":boolean  //only design for isApi=true model
            ,"auth":function(config,req,res,next)  return true or false
        }
    ]
    */
    settings.forEach((item) => {
        var methods = item.methods? ($util.isArray(item.methods)?item.methods :[item.methods]) : ["get"];
        var urls = $util.isArray(item.urls)? item.urls : [item.urls];
        item.methods = methods;
        item.urls = urls;
        item.active = (item.active==undefined ? true : item.active);
        if(item.active)
        {
            methods.forEach((method) => {
                urls.forEach((url) => {
                    $logger.info(`bind route:${method} ${url}`);
                    // if(isApi && !(Promise.resolve(item.handler) == Promise))
                    // {
                    //     $logger.error("API model, the handler must Promise function");
                    //     process.exit(1);
                    // }
                    $router[method](url, (req,res,next)=>{
                        //queryReader(req);
                        if(isApi)
                        {
                            var output = {meta: {status:200,timestamp:new Date().toISOString(),message:"success"},response:null};
                            if(!authenticate(item))
                            {
                                onAuthError(output,res);
                                return;
                            }
                            if(item.cache)
                            {
                                var key = JSON.stringify(buildKey(req));
                                $cache.add(key,$config.config.apiExpiresInMins,()=>{ return item.handler(item,req,res,next);})
                                    .then((result)=>{
                                        output.response = result;
                                        res.json(output);
                                    }).catch((err)=>{onError(err, output, res);});
                            }
                            else
                            {
                                item.handler(item,req,res,next)
                                    .then((r)=>{
                                        output.response = r;
                                        res.json(output);
                                    })
                                    .catch((err)=>{onError(err, output, res);});
                            }
                        }
                        else
                        {
                            if(!authenticate(item))
                            {
                                throw new Error("Invalid user token");
                            }
                            item.handler(item,req,res,next);
                        }
                    })
                });
            })
        }
        else
        {
            $logger.warn("disabled route",item.urls);
        }
    });
    return $router;
}
function authenticate(item) {
    return item.auth==undefined || item.auth();
}
function onAuthError(output, res) {
    $logger.error("invalidate user token");
    output.meta.status = res.statusCode = 504;
    output.meta.message = "invalidate user token";
    res.send(output);
}
function onError(err, output, res) {
    $logger.error(err);
    output.meta.status = res.statusCode = 500;
    output.meta.message = err.message;
    if ($config.debug) output.meta.detail = err.stack;
    res.send(output);
}
function queryReader(req) {
    //req.query    for read query string
    //req.body.key for read form post with x-www-form-urlencoded
    //req.body     for read payload post with Context-Type:application/json
    //req.params   for read url params /abc/:bb?
    if($util.isObject(req.body)) $logger.debug("Form body",req.body);
    if($util.isObject(req.query)) $logger.debug("Query String ", req.query);
    if($util.isObject(req.params)) $logger.debug("Url params",req.params);
    $logger.debug("Request heads",req.headers);
}
function buildKey(req) {
    return {query:req.url,body:req.body,params:req.params}
}
function api(settings){
    return bind(settings,true);
}
function page(settings){
    return bind(settings,false);
}
module.exports = {
    page:page
    ,api:api
};