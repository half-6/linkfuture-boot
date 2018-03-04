# Linkfuture boot   
<span class="badge-npmversion"><a href="https://npmjs.org/package/@linkfuture/boot" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@linkfuture/boot.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/@linkfuture/boot" title="NPM Download"><img src="https://img.shields.io/npm/dm/@linkfuture/boot.svg" alt="NPM Download" /></a></span> 
<span class="badge-npmstatus"><a href="https://circleci.com/gh/cyokin/linkfuture-boot" title="NPM Status"><img src="https://img.shields.io/circleci/project/github/cyokin/linkfuture-boot.svg" alt="NPM Status" /></a></span>
<span class="badge-npmlicense"><a href="#license" title="License"><img src="https://img.shields.io/npm/l/@linkfuture/boot.svg?style=flat-square" alt="License" /></a></span>

An simple way to boot express.  
 
## Prerequisites 
- nodejs 8.0 +
- npm 5.0 + 

## How to use it
``` js
const $consign = require('consign');
const $path = require('path');
//use lf boot
const $meta = {
    root:[optional,default is application root],
    resourceroot:[optional,default is under /<root>/src/resource/],
    webroot:[optional,default is under /<root>/src/webapp/],
}
const $lf_boot =require("@linkfuture/boot")($meta)
const $lf_boot_web =require("@linkfuture/boot").web();
const app = $lf_boot_web.app;
//setup view engine 
app.set('views', $path.join(__dirname, './views'));
app.set('view engine', 'ejs');

/*auto scan routers, binding all pages and apis by using consign*/
$consign({logger:$lf.$logger})
    .include("src/bin/repository")
    .then("src/bin/service")
    .then("src/bin/controller")
    .into(app);
$lf_boot.boot();

//for Mocha unit test only
module.exports = app;
```
## How to run build 
``` js
    "build": "node -e \"require('@linkfuture/boot')().build().build(['js','css'],false)\"",  //default compress is true, you can set false 
    "build SQL": "node -e \"require('@linkfuture/boot')().build().build(['sql'])\"",
```
## Global object
 After init linkfuture-boot, you can use below global object directly, no need require("") 
``` js
//Boot only
$lf._               //call lodash directly, 
$lf.$m              //call moment directly, 
$lf.$config.config  //read config file
$lf.$util           //utility method
$lf.$request        //promise request with retry
$lf.$cache          //store value into redis or static
$lf.$logger.silly   //write log by using winston 
//Web Boot only
$lf.$auth           //auth model
$lf.$siteInfo       //get basic site information
$lf.$md             //an middleware to specific auth required or is it api response and setup cache time, 
 ```

## How to use middleware module for auth and cache
``` js
app.get("/admin/",$ lf.$md(
        {
            min:0, // cache time in min
            key: function (req) { //optional, cache key, required redis setup,default value is following
                return `${req.method}_${req.getUrl}`;
            },
            api:false, //specific response type, JSON API or page, default is page
            auth:true, //is this page behind the authenciation or not, default is false
            roles:["admin"]  //array type, which role can access this page, required set auth=true,and req.user.roles = []
        }),(req,res,next)=>{
           res.send("Hello world");
        })
```

## Config.json
- config file can either JS or JSON format
- must under resource root folder. default resource root folder is under /<root>/src/resource/
- it will always read and merge two config files. config.json and config.<env>.json.

``` js
{
  //Optional, default value is base on NODE_ENV!='prod'
  "debug": true,
  //Optional for static, default value is following
  "static": {
    "minify":false,
    "jsHttp": "/static/js/",
    "cssHttp": "/static/css/",
    "jsBuildFile":"/static/js/build.json",
    "cssBuildFile":"/static/css/build.json"
  },
  "cache":{
    //if you want to use redis, then need following node
    "redis": {
      "options": {
        "url": "redis://[redis URL]:6379",
        "disable_resubscribing": true
      },
      "prefix": "__LF.NODE__"
    }
    "method": "redis" //redis or local,default is local
  },
  "auth":{
      "login":"/login",  //optional
      "logout":"/logout", //optional
      "loginSuccessURL": "/admin", //optional
      "logoutSuccessURL": "/", //optional
      "cookieOptions":{       //optional
        "httpOnly": true,
        "cookieAge": 7200000, // 2hr no need, as JWT will expired
        "secure": false, //true if url is https, otherwise false
        "expires": 0 //browser session only cookie
      },
      //use jwt to encrypt the cookie base token
      "jwt": {
        "secret": {
          "public": "./test/resource/public.key",
          "private": "./test/resource/private.key"
        },
        "options": {
          "expiresIn": "2h",
          "header": {
            "author": "LF"
          },
          "subject": "@LinkFuture/Boot",
          "audience": "browser",
          "algorithm": "RS256",
          "issuer": "LINK FUTURE LLC"
        }
      },
      "event":{ //optional
          "onLoginSuccess":function (res, user) {
              $lf.$logger.silly("onLoginSuccess");
          },
          "onLogoutSuccess":function (res, user) {
              $lf.$logger.silly("onLogoutSuccess");
          }
      },
     "method": "form",   //form or auth0 or null
     "auth0": {  //need append this if use auth0 as auth
        "clientID": "[auth0 clientID]",
        "domain": "[auth0 domain]",
        "clientSecret": "[auth0 clientSecret]",
        "responseType": "code",
        "scope": "openid profile",
        "audience": "[auth0 audience]",
        "callbackURL": "/callback"
      }
  },
  //Optional
  "mappings": [
    {"pattern": "/admin/*", "auth":true, "roles": ["ETA Dashboard"], "method": ["get", "post"]},
    {"pattern": "/api/db", "api":false,"auth":true},
    {"pattern": "/api/login", "api":true,"auth":false},
    {"pattern": "/api/*", "api":true,"auth":true,"min":10, "roles": ["ETA Dashboard"]}
  ],
  //Optional
  "helmet":{
    "frameguard": false
  },
  //Optional for logger, default value is following
  "log":{
    "logFolder":"logs"
    ,"logLevel":"silly"
    ,"showDate":true
  },
  //Optional for api/config, default value is following
  "lf_admin":{
    "username":"admin"
   ,"password":"[admin password]"
  },
  //Optional for api/config, default value is following
  "error":{
    "error400":"error400",
    "error500":"error500"
  },
  //Optional for retry
  "retryOptions":{
    "retries": 3,
    "minTimeout": 1000,
    "maxTimeout": 3000,
    "randomize": true
  }
}

```

## How to read config
``` js
//read config by default NODE_ENV
$lf.$config.config.XXX 
//read config by pass env
const $config = $lf.$config.readEnvConfig('prod', $meta);
$config.config.XXX
```