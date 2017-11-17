'use strict';
/**
 * Module Name: logger
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $winston = require('winston');
require('winston-daily-rotate-file');
const $stack = require('stack-trace');
const $assert = require('assert');
const $fs = require('fs');
const $path = require('path');
//noinspection NpmUsedModulesInstalled
const $color = require('cli-color');
const _ = require('lodash');
const $util = require('./util');
const $defaultMeta = {
  logFolder: 'logs',
  logLevel: 'silly',
  showDate: true
};

const colorMapping = {
  trace: 'magenta',
  silly: 'magenta',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  debug: 'blue',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  error: 'red'
};

const $config = $lf.$config;
const $meta = _.merge({}, $defaultMeta, _.get($config, 'config.log'));

if (!$path.isAbsolute($meta.logFolder)) {
  $meta.logFolder = $path.join($config.root, $meta.logFolder);
}
if (!$fs.existsSync($meta.logFolder)) {
  $fs.mkdirSync($meta.logFolder);
}
$winston.level = (process.env.LOG_LEVEL || $meta.logLevel).trim();
const LOG_DATE = $util.parseBool(process.env.LOG_DATE) || $meta.showDate;

function getCaller() {
  const fromClassList = $stack.get();
  let foundLogger = false;
  for (let i = 0; i < fromClassList.length; i++) {
    const item = fromClassList[i];
    //noinspection JSUnresolvedFunction
    const funName = item.getFunctionName();
    //noinspection JSUnresolvedFunction
    const fileName = item.getFileName();
    //find caller which is logger.log, then next file would be caller
    if (fileName === __filename && funName === 'log') {
      foundLogger = true;
    } else if (fileName !== __filename && foundLogger) {
      //noinspection JSUnresolvedFunction
      return `${fileName}(${item.getLineNumber()},${item.getColumnNumber()})`;
    }
  }
}
function formatter(options) {
  //https://github.com/eugeny-dementev/winston-console-formatter/
  let extend =
    `[${colorify(options.level, options.level.toUpperCase())}]` +
    `[${getCaller()}] `;
  // eslint-disable-next-line no-unused-expressions
  LOG_DATE &&
    (extend = `[${new Date()
      .toISOString()
      .split('T')
      .join(' ')}] ${extend}`);
  return options.message ? extend + options.message : '';
  // + (options.meta && Object.keys(options.meta).length ? $newLine + extend + JSON.stringify(options.meta) : '')
}

function colorify(level, string) {
  return $color[colorMapping[level]](string);
}
// noinspection JSUnusedGlobalSymbols
const $logger = new $winston.Logger({
  transports: [
    new $winston.transports.Console({
      formatter,
      level: $winston.level,
      prettyPrint: true,
      colorize: true,
      silent: false
    }),
    new $winston.transports.DailyRotateFile({
      name: 'all-file',
      datePattern: 'yyyy-MM-dd.',
      prepend: true,
      filename: $path.join($meta.logFolder, 'all.log'),
      level: $winston.level,
      json: false
    }),
    new $winston.transports.DailyRotateFile({
      name: 'error-file',
      datePattern: 'yyyy-MM-dd.',
      prepend: true,
      filename: $path.join($meta.logFolder, 'error.log'),
      level: 'error',
      json: false
    }) //only log error and below
  ],
  exceptionHandlers: [
    new $winston.transports.File({
      filename: $path.join($meta.logFolder, 'exception.log')
    })
  ],
  exitOnError: false
});
function log(type, msg, args) {
  $assert(msg, 'log content is required');
  if (_.isObject(args)) {
    $logger.log(type, msg);
    if (args instanceof Error) {
      args = {
        message: args.message,
        stack: args.stack
      };
    }
    $logger.log(type, JSON.stringify(args));
  } else {
    $logger.log(type, msg, args);
  }
}

/*
 log level
 { error: 0, warn: 1, info: 2, verbose: 3, debug(log): 4, silly: 5 }
 */
module.exports = {
  log(msg, args) {
    log('silly', msg, args);
  },
  silly(msg, args) {
    log('silly', msg, args);
  },
  debug(msg, args) {
    log('debug', msg, args);
  },
  verbose(msg, args) {
    log('verbose', msg, args);
  },
  info(msg, args) {
    log('info', msg, args);
  },
  warn(msg, args) {
    log('warn', msg, args);
  },
  error(msg, args) {
    log('error', msg, args);
  },
  $meta
};
