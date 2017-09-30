"use strict";
/**
 * Module Name: redis cache
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $redis = require('redis');
const $bluebird = require('bluebird');
const $logger = require('./logger');
const $assert = require('assert');
const _ = require('lodash');
//make redis client promise
//noinspection JSUnresolvedFunction
$bluebird.promisifyAll($redis.RedisClient.prototype);
//noinspection JSUnresolvedFunction
$bluebird.promisifyAll($redis.Multi.prototype);

/**
 * build cache
 * @param meta
 "redis":{
          "options": {
            "url": "redis://192.168.1.2:6379",
            "disable_resubscribing": true
          },
          "prefix": "__LF.NODE__"
        },
 */
const $cacheMethod = {
    "prefix": "__LF.BOOT__"
};
const $defaultMeta = {
    method:$cacheMethod.local
};
const $meta = _.merge({},$defaultMeta,_.get($lf.$config,"config.cache.redis"));
$assert($meta,"missing cache setting");

let $redis_client = null;
function getRedisClient() {
    if(!$redis_client){
        $redis_client = $redis.createClient($meta.options);
        $redis_client.on('error', function (err) {
            $logger.error(JSON.stringify(err));
        });
    }
    return $redis_client;
}
async function get(key){
    let newKey = buildRedisKey(key);
    let result = await getRedisClient().getAsync(newKey);
    if(!result)
    {
        return null;
    }
    $logger.info(`found ${key} from redis`);
    return JSON.parse(result);
}
function set(key,r,min) {
    let newKey = buildRedisKey(key);
    let stringResult = JSON.stringify(r);
    if(min)
    {
        $logger.info(`set ${stringResult} into redis(${key}) for ${min}m`);
        getRedisClient().setex(newKey, min * 60, stringResult);
    }
    else
    {
        $logger.info(`set ${stringResult} into redis(${key}) forever`);
        getRedisClient().set(newKey, stringResult);
    }

}
async function upsert(key, callback,min) {
    let found = await get(key);
    if(!found)
    {
        let result = callback();
        set(key,result,min);
        return result
    }
    return found;
}
function del(key) {
    let newKey = buildRedisKey(key);
    getRedisClient().del(newKey);
    $logger.info(`delete ${key} from redis`);
}
function buildRedisKey(key) {
    return `${$meta.prefix}_${key}`;
}
module.exports = {
    get,
    set,
    del,
    upsert
};