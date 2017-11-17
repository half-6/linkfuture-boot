'use strict';
/**
 * Module Name: cache
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */

const $assert = require('assert');
const _ = $lf._;
const $local = require('./cache-local');
const $redis = require('./cache-redis');

/**
 * build cache
 * @param meta
 "cache":{
        "method":"redis" //redis or local
      }
 */
const $cacheMethod = {
  local: 'local',
  redis: 'redis'
};
const $defaultMeta = {
  method: $cacheMethod.local
};

const $meta = _.merge({}, $defaultMeta, _.get($lf.$config, 'config.cache'));
$assert($meta, 'missing cache setting');
function factory() {
  switch ($meta.method) {
    case $cacheMethod.redis:
      return $redis;
    default:
      return $local;
  }
}

module.exports = {
  local: $local,
  redis: $redis,
  factory: factory(),
  $meta
};
