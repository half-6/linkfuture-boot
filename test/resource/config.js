module.exports = {
    //Optional, default value is base on NODE_ENV!='prod'
    "debug": true,
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
                "url": "redis://192.168.1.2:6379",
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
            "secure": true,
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
        , "mappings": [
            {"pattern": "/admin/*", "roles": ["ADMIN"], "method": ["get", "post"]},
            {"pattern": "/profile/*"}
        ]
    },
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
    }
}