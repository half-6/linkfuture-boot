/* eslint-disable global-require */
'use strict';
/**
 * Module Name: index
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $debugger = require('debug')('lf-boot');
global.$lf = global.$lf || {};
global.$lf._ = require('lodash');
global.$lf.$m = require('moment');
global.$lf.$debugger = $debugger;
global.$lf.$util = require('./utility/util');

module.exports = meta => {
  $debugger('Start LinkFuture Boot');
  global.$lf.$config = require('./utility/config')(meta);
  global.$lf.$logger = require('./utility/logger');
  global.$lf.$cache = require('./utility/cache');
  global.$lf.$request = require('./utility/request');

  // process.on('unhandledRejection', (reason, p) => {
  //   $lf.$logger.error('unhandledRejection', reason, p);
  // });
  $lf.$logger.silly(
    'Initialize LinkFuture Boot Success,you can access utility packages at global.$lf'
  );
  $lf.$logger.silly(
    `Utility packages include ${JSON.stringify(Object.keys($lf))}`
  );
  return {
    web: require('./web'),
    build: require('./build')
  };
};
