"use strict";
/**
 * Module Name: cache
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $redis = require('redis');
const $bluebird = require('bluebird');
const $logger = require('./logger');
const $assert = require('assert');
//make redis client promise
//noinspection JSUnresolvedFunction
$bluebird.promisifyAll($redis.RedisClient.prototype);
//noinspection JSUnresolvedFunction
$bluebird.promisifyAll($redis.Multi.prototype);

/**
 * build cache
 * @param meta
 "cache":{
        "redis": {
          "options": {
            "url": "redis://192.168.1.2:6379",
            "disable_resubscribing": true
          },
          "prefix": "__LF.NODE__"
        }
      }
 */
const $meta = $lf.$config.config.cache;
$assert($meta,"missing cache setting");

//region static cache
const $static_cache = {};
function upsetStatic(key, callback) {
    if($static_cache[key]==null)
    {
        const result = callback();
        $logger.info(`set ${result} into static forever`);
        $static_cache[key] = result;
    }
    return $static_cache[key];
}
//endregion

//region redis
function getRedisClient() {
    return upsetStatic(`$redis_client_${$meta.redis.options.url}`,()=>{
        let $redis_client = $redis.createClient($meta.redis.options);
        $redis_client.on('error', function (err) {
            $logger.error(JSON.stringify(err));
        });
        return $redis_client
    })
}
function getRedis(key){
    return new Promise ((f,r) =>{
        key = buildRedisKey(key);
        getRedisClient().getAsync(key)
            .then(r1=>{
                if(r1){
                    $logger.info(`found ${key}:${r1} from redis`);
                    f(JSON.parse(r1));
                }
                else(r(new Error("Not found")));
            })
            .catch(err=>{
                r(err);
            })
    })
}
function setRedis(key,r,min) {
    key = buildRedisKey(key);
    let stringResult = JSON.stringify(r);
    if(min)
    {
        $logger.info(`set ${stringResult} into redis(${key}) for ${min}m`);
        getRedisClient().setex(key, min * 60, stringResult);
    }
    else
    {
        $logger.info(`set ${stringResult} into redis(${key}) forever`);
        getRedisClient().set(key, stringResult);
    }
}
function upsetRedis(key, min, promise) {
    return new Promise((fulfill, reject)=>{
        key = buildRedisKey(key);
        getRedis(key)
            .then(r1=>{
                fulfill(r1);
            })
            .catch(err=>{
                promise()
                    .then((r2)=>{
                        setRedis(key,r2,min);
                        fulfill(r2);
                    })
                    .catch(err=>{
                        reject(err);
                    })
            });
    });
}
function buildRedisKey(key) {
    return $meta.redis.prefix + key;
}
//endregion

module.exports = {
    upsetStatic
    ,upsetRedis
    ,setRedis
    ,getRedis
    ,staticCache :$static_cache
    ,$meta
};