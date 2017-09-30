#Linkfuture boot
An simple way to boot express. 
 
##Prerequisites 
- nodejs 8.0 +
- npm 5.0 + 

##How to use it
``` js
const $consign = require('consign');
const $path = require('path');
//use lf boot
const $lf_boot =require("@linkfuture/boot").web();
const app = $lf_boot.app;
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
### how to run build 
``` js
    "build": "node -e require('@linkfuture/boot').build().build(['sql'])"
```
### Global object
 After init linkfuture-boot, you can use below global object directly, no need require("") 
``` js
$lf.$config.config  //read config file
$lf.$util           //utility method
$lf.$cache          //store value into redis or static
$lf.$logger.silly   //write log by using winston 
$lf.$auth           //auth model
$lf.$siteInfo       //get basic site information
$lf._               //call lodash directly, 
$lf.$m              //call moment directly, 
$lf.$md             //an middleware to specific auth required or is it api response and setup cache time, 
 ```

### How to use middleware module for auth and cache
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
```

### config.json
``` js
{
  //Optional, default value is base on NODE_ENV!='prod'
  "debug": true,
  //Optional for static, default value is following
  "static": {
    "minify":false,
    "jsFolder": "src/webapp/static/js/",
    "cssFolder": "src/webapp/static/css/",
    "jsHttp": "/static/js/",
    "cssHttp": "/static/css/",
    "jsBuildFile":"./test/static/js/build.json",
    "cssBuildFile":"test/static/css/build.json"
  },
  "cache":{
    //if you want to use redis, then need following node
    "redis": {
      "options": {
        "url": "redis://192.168.1.2:6379",
        "disable_resubscribing": true
      },
      "prefix": "__LF.NODE__"
    }
  },
  "auth":{
      "login":"/login",  //optional
      "logout":"/logout", //optional
      "loginSuccessURL": "/admin", //optional
      "logoutSuccessURL": "/", //optional
      "cookieOptions":{       //optional
        "httpOnly": true,
        "cookieAge": 7200000, // 2hr no need, as JWT will expired
        "secure":true,
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
     "method": "form",   //form or auth0 or null
     "auth0": {  //need append this if use auth0 as auth
        "clientID": "0t1dsFyaYgmEnqdtfit188MhqlGuAluC",
        "domain": "etalogin.auth0.com",
        "clientSecret": "p96yE_KpXllavEifW0Gv3d9_lA9YnjH08y74q_fs2ijJtKAJgBqgMDs2fRRREjqY",
        "responseType": "code",
        "scope": "openid profile",
        "audience": "https://etalogin.auth0.com/userinfo",
        "callbackURL": "/callback"
    }
      ,"mappings":[
        {"pattern":"/admin/*","roles":["ADMIN"],"method":["get","post"]},
        {"pattern":"/profile/*"}
      ]
  },
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
   ,"password":"qwer1234"
  },
  //Optional for api/config, default value is following
  "error":{
    "error400":"error400",
    "error500":"error500"
  }
}

```