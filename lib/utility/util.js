"use strict";
/**
 * Module Name: util
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 * Must no any dependency
 */
const $util = require('util');
const $strip= require('strip-json-comments');
const $fs= require('fs');

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
    let matches = hdrValue.match(re);
    return matches && { scheme: matches[1], value: matches[2] };
}

/**
 * Generic error callback and log exception
 * @param name
 * @param done
 * @return {Function}
 */
function errorBack(name,done) {
    return function (err) {
        if(err) $logger.error(name,err);
        done();
    }
}

/**
 * String compare
 * @param string1
 * @param string2
 * @param ignoreCase
 * @param useLocale
 * @return {boolean}
 */
function compareStrings (string1, string2, ignoreCase, useLocale) {
    if (ignoreCase) {
        if (useLocale) {
            string1 = string1.toLocaleLowerCase();
            string2 = string2.toLocaleLowerCase();
        }
        else {
            string1 = string1.toLowerCase();
            string2 = string2.toLowerCase();
        }
    }
    return string1 === string2;
}

String.prototype.equalsIgnoreCase = function (string2) {
    return compareStrings(this,string2,true);
};

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
 * @return {obj[0]}
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
    if(input === undefined || input === null || typeof input === "boolean")
    {
        return input;
    }
    if (typeof input === "string"){
        switch (input.toLower())
        {
            case "true":return true;
            case "false": return false;
            case "1": return true;
            case "0": return false;
            default: return false;
        }
    }
    if (typeof input === "number"){
        switch (input)
        {
            case 1: return true;
            case 0: return false;
            default: return false;
        }
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
 * @returns {boolean or defaultValue}
 */
function isNil(obj,defaultValue) {
    let result = obj === undefined || obj === null;
    if(defaultValue)
    {
         return result? defaultValue : obj;
    }
    return result;
}

/**
 * Read json file with comments,return json object
 * @param path
 * @returns {json object}
 */
function readJson(path) {
    if($fs.existsSync(path))
    {
        return JSON.parse($strip($fs.readFileSync(path,"utf-8")));
    }
    throw new Error(`specific file ${path} doesn't exist`);
}

/**
 * Convert all string to uppercase inside given array
 * @param array
 */
function arrayToUpperCase(array) {
    return array.map( (el) => (typeof el === "string") ? el.toUpperCase() : el)
}

/**
 * Async support for express router
 * @param async (req,res,next){}
 * @returns {express request}
 * @example
 *     app.get("/api/example",$lf.$util.async(async (req,res,next)=>{
 *          let result = await $pgQuery.selectOne("user");
 *          res.send(result);
 *     }))
 */
function async(fn)
{
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };
}

module.exports = {
    async,
    arrayToUpperCase,
    isNil,
    isEmpty,
    errorBack,
    compareStrings,
    parseHeader,
    getFirstKey,
    getFirst,
    getRandomIntInc,
    parseBool,
    readJson
};