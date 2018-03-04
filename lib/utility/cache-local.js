'use strict';
/**
 * Module Name:local cache
 * Project Name: LinkFuture.Boot
 * Created by Cyokin on 9/29/2017
 */
const $static_cache = {};
const $assert = require('assert');
function get(key) {
  $assert(key, 'key is required');
  clear();
  if (!$static_cache[key]) {
    return null;
  }
  $lf.$logger.silly(`found ${key} from local`);
  return $static_cache[key].result;
}
function set(key, result, min) {
  $assert(key, 'key is required');
  const now = new Date().getTime();
  // eslint-disable-next-line no-unused-expressions
  min
    ? $lf.$logger.silly(`set ${key} into local in ${min}m`)
    : $lf.$logger.silly(`set ${key} into local forever`);
  const expire = min ? now + min * 60 * 1000 : 0;
  $static_cache[key] = {
    result,
    expire
  };
}
function upsert(key, callback, min) {
  $assert(key, 'key is required');
  const found = get(key);
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
  delete $static_cache[key];
  $lf.$logger.silly(`delete ${key} from local`);
}
function clear() {
  const now = new Date().getTime();
  $lf._.forEach($static_cache, (value, key) => {
    if ($static_cache[key].expire !== 0 && $static_cache[key].expire < now) {
      del(key);
    }
  });
}
module.exports = {
  get,
  set,
  del,
  upsert,
  clear,
  memory: $static_cache
};
