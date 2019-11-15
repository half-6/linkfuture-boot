'use strict';
/**
 * Module Name: util
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 * Must no any dependency
 */
const $util = require('util');
const $strip = require('strip-json-comments');
const $fs = require('fs');
const $newLine = require('os').EOL;
const promiseRetry = require('promise-retry');

/**
 * Promise retry
 * @param meta
 * @returns Promise
 */
function myRetry(meta) {
  const { promise, context, verify, retryOptions } = meta;
  const options = $lf._.merge(
    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 3000,
      randomize: true
    },
    $lf.$config.config.retryOptions,
    retryOptions
  );
  return promiseRetry((retry, number) => {
    return promise.catch(error => {
      if (verify && !verify(error, number)) {
        throw error;
      }
      if (number <= options.retries) {
        $lf.$logger.warn(
          `${context ? context : ''} with error: ${
            error.message
          }, retry attempt ${number}`
        );
      }
      retry(error);
    });
  }, options);
}

/**
 * run all async promise method, and get result with object id.
 * @param metaList meta list, example {<key1>:<promiseFunction1>,<key2>:<promiseFunction2>}
 * @param ignoreError ignore error, default is true
 * @returns Results, example: {key1:result1,key2:result2}
 */
async function promiseAll(metaList, ignoreError = true) {
  const result = await Promise.all(
    $lf._.chain(metaList)
      .keys()
      .map(key => {
        if (ignoreError) {
          return metaList[key]
            .then(r => {
              return { id: key, value: r };
            })
            .catch(e => e);
        } else {
          return metaList[key].then(r => {
            return { id: key, value: r };
          });
        }
      })
      .value()
  );
  return $lf._.chain(result)
    .keyBy('id')
    .mapValues('value')
    .value();
}

/**
 * Check if object it empty or not
 * @param obj
 * @return {boolean}
 */
function isEmpty(obj) {
  return $util.isObject(obj) && Object.keys(obj).length === 0;
}

function parseHeader(hdrValue) {
  const re = /(\S+)\s+(\S+)/;
  if (typeof hdrValue !== 'string') {
    return null;
  }
  const matches = hdrValue.match(re);
  return matches && { scheme: matches[1], value: matches[2] };
}

/**
 * String compare
 * @param string1
 * @param string2
 * @param ignoreCase
 * @param useLocale
 * @return {boolean}
 */
function compareStrings(string1, string2, ignoreCase, useLocale) {
  if (ignoreCase) {
    if (useLocale) {
      string1 = string1.toLocaleLowerCase();
      string2 = string2.toLocaleLowerCase();
    } else {
      string1 = string1.toLowerCase();
      string2 = string2.toLowerCase();
    }
  }
  return string1 === string2;
}

/**
 * Get first key in the object
 * @param obj
 * @return {string}
 */
function getFirstKey(obj) {
  return Object.keys(obj)[0];
}

/**
 * Get first value in the object
 * @param obj
 * @return first value
 */
function getFirst(obj) {
  return obj[getFirstKey(obj)];
}

/**
 * Build random integrate on given range
 * @param min
 * @param max
 * @return {INT}
 */
function getRandomIntInc(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Convert 1,0,"1","0","true","false" to boolean
 * @param input
 * @returns {boolean}
 */
function parseBool(input) {
  if (input === undefined || input === null || typeof input === 'boolean') {
    return input;
  }
  if (typeof input === 'string') {
    input = input.toLowerCase();
    return input === 'true' || input === '1';
  }
  if (typeof input === 'number') {
    return input === 1;
  }
  //unknown type, always return false
  return false;
}

/**
 * Check object is null or undefined
 *    return Default value if true
 *    return boolean if undefined or null
 * @param obj
 * @param defaultValue
 * @returns boolean or defaultValue
 */
function isNil(obj, defaultValue) {
  const result = obj === undefined || obj === null;
  if (defaultValue) {
    return result ? defaultValue : obj;
  }
  return result;
}

/**
 * Read json file with comments,return json object
 * @param path
 * @returns json object
 */
function readJson(path) {
  if ($fs.existsSync(path)) {
    return JSON.parse($strip($fs.readFileSync(path, 'utf-8')));
  }
  throw new Error(`specific file ${path} doesn't exist`);
}

/**
 * Convert all string to uppercase inside given array
 * @param array
 */
function arrayToUpperCase(array) {
  return array.map(el => (typeof el === 'string' ? el.toUpperCase() : el));
}

function getEndTime(hrStart) {
  const hrEnd = process.hrtime(hrStart);
  const second = hrEnd[0];
  const ms = (hrEnd[1] / 1000000).toFixed(2);
  return second > 0 ? `${second}s ${ms}ms` : `${ms}ms`;
}

/**
 * Async support for express router
 * @param fn
 * @returns function result
 * @example
 *     app.get("/api/example",$lf.$util.async(async (req,res,next)=>{
 *          let result = await $pgQuery.selectOne("user");
 *          res.send(result);
 *     }))
 */
function async(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  async,
  arrayToUpperCase,
  isNil,
  getEndTime,
  isEmpty,
  compareStrings,
  parseHeader,
  getFirstKey,
  getFirst,
  getRandomIntInc,
  parseBool,
  readJson,
  myRetry,
  promiseRetry,
  promiseAll,
  newLine: $newLine
};
