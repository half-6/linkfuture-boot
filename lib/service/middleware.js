/**
 * Created by Cyokin
 * on 1/8/2017.
 */
const $config = $lf.$config;
const _ = require('lodash');
const $defaultMeta = {
    min:0,
    key: function (req) {
        return `${req.method}_${req.getUrl}`;
    },
    api:false,
    auth:false,
    roles:null //array for required roles, make sure req.user.roles = []
};

function buildResponse(meta,key,res) {
    res.sendResponse = res.send;
    res.send = body =>{
        res.send = res.sendResponse;
        if(res.statusCode>=200 && res.statusCode<300)
        {
            let output = meta.api?$lf.$siteInfo.getApiSuccessOutput(res,body) : body;
            if(meta.store)$lf.$cache.setRedis(key,output,meta.min);
            return res.send(output);
        }
        else
        {
            if(meta.api && res.statusCode>=500)
            {
                return res.json($lf.$siteInfo.getApiErrorOutput(res));
            }
            return res.send(body);
        }
    };
}

function bind(input,req, res, next) {
    let meta  = _.merge({},$defaultMeta,input);
    res.meta = meta;
    let key = meta.key(req);
    //authenticate
    if( meta.auth && !$lf.$auth.hasAccess(req,meta.roles))
    {
        $lf.$logger.warn("Unauthenticated user access" + req.getUrl);
        if(meta.api)
        {
            res.status(401);
            res.err = new Error("Unauthenticated");
            res.json($lf.$siteInfo.getApiErrorOutput(res));
            return;
        }
        else
        {
            res.redirect($lf.$auth.getLoginUrl(req.getUrl));
            return;
        }
    }

    //force fetch cache
    if(req.headers['x-api-cache-force-fetch'] || meta.min<=0)
    {
        $lf.$logger.silly("force or no cache request");
        //add header for api only
        if(meta.api)
        {
            meta.store = false;
            buildResponse(meta,key,res);
        }
        next();
        return;
    }

    //add response cache, only add cache for unauth page
    if(!meta.auth){
        res.header({
            'cache-control': 'public, max-age=' + meta.min * 60
        });
    }
    $lf.$cache.getRedis(key)
        .then(cachedBody=>{
            res.send(cachedBody);
        })
        .catch(err=>{
            $lf.$logger.error("get redis error",err);
            meta.store = true;
            buildResponse(meta,key,res);
            next();
        });
}
module.exports = (meta)=>{
    return (req, res, next) =>{
        return bind(meta,req,res,next);
    }
};