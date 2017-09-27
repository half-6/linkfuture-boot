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

function objectIsEmpty(obj) {
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

function errorBack(name,done) {
    return function (err) {
        if(err) $logger.error(name,err);
        done();
    }
}

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

function getFirstKey(obj) {
    return Object.keys(obj)[0];
}

function getFirst(obj) {
    return obj[getFirstKey(obj)];
}

function getRandomIntInc(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
 * result = null or undefined
 *    return Default value ? result ? Default value:input
 *    return result
 * @param obj
 * @param defaultValue
 * @returns {*}
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
 * read json file with comments,return json object
 * @param path
 */
function readJson(path) {
    if($fs.existsSync(path))
    {
        return JSON.parse($strip($fs.readFileSync(path,"utf-8")));
    }
    throw new Error(`specific file ${path} doesn't exist`);
}

function arrayToUpperCase(array) {
    return array.map( (el) => (typeof el === "string") ? el.toUpperCase() : el)
}

module.exports = {
    arrayToUpperCase,
    isNil,
    errorBack,
    objectIsEmpty,
    compareStrings,
    parseHeader,
    getFirstKey,
    getFirst,
    getRandomIntInc,
    parseBool,
    readJson
};