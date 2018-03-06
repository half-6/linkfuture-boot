'use strict';
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
  prefix: '__LF.BOOT__'
};
const $defaultMeta = {
  method: $cacheMethod.local
};
const $meta = _.merge(
  {},
  $defaultMeta,
  _.get($lf.$config, 'config.cache.redis')
);
$assert($meta, 'missing cache setting');

let $redis_client = null;
function getRedisClient() {
  if (!$redis_client) {
    $redis_client = $redis.createClient($meta.options);
    $redis_client.on('connect', () => {
      $logger.silly(`connected to redis ${$redis_client.address} success`);
    });
    $redis_client.on('error', err => {
      $logger.error(JSON.stringify(err));
    });
  }
  return $redis_client;
}
async function get(key) {
  $assert(key, 'key is required');
  const newKey = buildRedisKey(key);
  const result = await getRedisClient().getAsync(newKey);
  if (!result) {
    return null;
  }
  $logger.silly(`found ${key} from redis`);
  return JSON.parse(result);
}
function set(key, r, min) {
  $assert(key, 'key is required');
  const newKey = buildRedisKey(key);
  const stringResult = JSON.stringify(r);
  if (min) {
    $logger.silly(`set ${stringResult} into redis(${key}) for ${min}m`);
    getRedisClient().setex(newKey, min * 60, stringResult);
  } else {
    $logger.silly(`set ${stringResult} into redis(${key}) forever`);
    getRedisClient().set(newKey, stringResult);
  }
}
async function upsert(key, callback, min) {
  $assert(key, 'key is required');
  const found = await get(key);
  if (!found) {
    // eslint-disable-next-line callback-return
    const result = callback();
    set(key, result, min);
    return result;
  }
  return found;
}
function del(key) {
  $assert(key, 'key is required');
  const newKey = buildRedisKey(key);
  getRedisClient().del(newKey);
  $logger.silly(`delete ${key} from redis`);
}
function buildRedisKey(key) {
  return `${$meta.prefix}_${key}`;
}

function close() {
  getRedisClient().quit();
  $redis_client = null;
  $logger.silly(`close redis success`);
}
module.exports = {
  get,
  set,
  del,
  close,
  upsert
};
