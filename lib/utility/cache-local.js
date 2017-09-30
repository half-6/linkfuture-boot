/**
 * Module Name:local cache
 * Project Name: LinkFuture.Boot
 * Created by Cyokin on 9/29/2017
 */
const $logger = require('./logger');
const $static_cache = {};
function get(key) {
    let now = new Date().getTime();
    if(!$static_cache[key] || ($static_cache[key].expire!=0 && $static_cache[key].expire< now))
    {
        return null;
    }
    $logger.info(`found ${key} from local`);
    return $static_cache[key].result;
}
function set(key, result,min) {
    let now = new Date().getTime();
    min? $logger.info(`set ${key} into local in ${min}m`):$logger.info(`set ${key} into local forever`);
    let expire = min? now + min * 60 * 1000 : 0;
    $static_cache[key] = {
        result,
        expire
    };
}
function upsert(key,callback,min) {
    let found = get(key);
    if(!found)
    {
        const result = callback();
        set(key,result,min);
        return result
    }
    return found;
}
function del(key) {
    delete $static_cache[key];
    $logger.info(`delete ${key} from local`);
}
module.exports={
    get,
    set,
    del,
    upsert,
    memory:$static_cache
};