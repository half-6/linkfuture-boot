'use strict';
/**
 * Module Name:local cache
 * Project Name: LinkFuture.Boot
 * Created by Cyokin on 9/29/2017
 */
const $static_cache = {};
function get(key) {
  const now = new Date().getTime();
  if (
    !$static_cache[key] ||
    ($static_cache[key].expire !== 0 && $static_cache[key].expire < now)
  ) {
    return null;
  }
  $lf.$logger.silly(`found ${key} from local`);
  return $static_cache[key].result;
}
function set(key, result, min) {
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
  delete $static_cache[key];
  $lf.$logger.silly(`delete ${key} from local`);
}
module.exports = {
  get,
  set,
  del,
  upsert,
  memory: $static_cache
};
