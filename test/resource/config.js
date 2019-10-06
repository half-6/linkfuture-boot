module.exports = {
    //Optional, default value is base on NODE_ENV!='prod'
    "debug": true,
    "env":"test-${NODE_ENV}-a",
    "lfTemp":"test-${LF_TEMP}-b",
    "lfTest":"test-${UNIT_TEST}-c",

    /*
    * Optional,all configuration is same with request npm,
    * but add apiForward and apiMethod
    *    apiForward:for disable auto api forward
    *    apiMethod: overwrite default api method
    * */
    "service":{
        "test":{
            "baseUrl": "https://httpstat.us/",
            "400":{
                "url": "400",
                "method": "get",
                "json": true,
                "apiForward":false
            },
            "200":{
                "url": "200",
                "method": "get",
                "apiMethod":["get","post"],
                "json": true,
                "qs":{
                    "sleep":1000
                }
            }
        }
    },
    //Optional for static, default value is following
    "static": {
        "minify": false,
        "jsHttp": "/static/js/",
        "cssHttp": "/static/css/",
        "jsBuildFile": "./test/static/js/build.json",
        "cssBuildFile": "test/static/css/build.json"
    },
    "cache": {
        //if you want to use redis, then need following node
        "redis": {
            "options": {
                "url": "redis://linkfuture-demo:EB3A0D669E77133D28DCAA3386255F97@pub-redis-13941.us-west-2-1.1.ec2.garantiadata.com:13941",
                "disable_resubscribing": true
            },
            "prefix": "__LF.NODE__"
        },
        "method": "local" //redis or local,default is local
    },
    "auth": {
        "login": "/login",  //optional
        "logout": "/logout", //optional
        "loginSuccessURL": "/admin", //optional
        "logoutSuccessURL": "/", //optional
        "cookieOptions": {       //optional
            "httpOnly": true,
            "cookieAge": 7200000, // 2hr no need, as JWT will expired
            "secure": false, //true if url is https, otherwise false
            "expires": 0 //browser session only cookie
        },
        "event":{ //optional
            "onLoginSuccess":function (res, user) {
                $lf.$logger.silly("onLoginSuccess");
            },
            "onLogoutSuccess":function (res, user) {
                $lf.$logger.silly("onLogoutSuccess");
            }
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
        "method": null,   //auth0|form|null
        "auth0": {  //need append this if use auth0 as auth
            "clientID": "kRPDHIuos6tqpflh1I2ZJ7Hozmvb0FzV",
            "domain": "linkfuture.auth0.com",
            "clientSecret": "Tu6Wm0hN-1w2guOXlBQJM4lFBPVAof67J_OaFq3rV8JjV4cFF9kkOl94IJ1mieKR",
            "responseType": "code",
            "scope": "openid profile",
            "audience": "https://linkfuture.auth0.com/userinfo",
            "callbackURL": "/callback"
        },
    },
    "mappings": [
        {"pattern": "/api/test/*", "api":true,"auth":false},
	    {"pattern": "/admin/*", "auth":true, "roles": ["ETA Dashboard"], "method": ["GET", "POST"]},
	    {"pattern": "/api/db", "api":false,"auth":true},
	    {"pattern": "/api/login", "api":true,"auth":false},
	    {"pattern": "/api/*", "api":true,"auth":true,"min":10, "roles": ["ETA Dashboard"]}
    ],
    //Optional
    "helmet": {
        "frameguard": false
    },
    //Optional for logger, default value is following
    "log": {
        "logFolder": "logs"
        , "logLevel": "silly"
        , "showDate": true
    },
    //Optional for api/config, default value is following
    "lf_admin": {
        "username": "admin"
        , "password": "qwer1234"
    },
    //Optional for error page, default value is following
    "error": {
        "error400": "error400",
        "error500": "error500"
    },
	//Optional for request retry, default value is following
    "retryOptions":{
        "retries": 3,
        "minTimeout": 1000,
        "maxTimeout": 3000,
        "randomize": true
      },
    "requestOptions":{
        "timeout": 5000,
    },
    //Optional, url proxy, forward request to target url.
    "proxy":[
      {
        "url":"/api/proxy/*",
        "forwardBaseUrl":"http://api.se.dev.qingshuxuetang.com/api/",
        "headers":{}, //optional
        "query":{}, //optional
        "body":{} //optional
      }
    ],
    //single application history mode
    //reference connect-history-api-fallback for configuration detail
    "history":{
        "disableDotRule": false,
        "verbose": false,
        "htmlAcceptHeaders": ["text/html", "application/xhtml+xml"]
    }
}