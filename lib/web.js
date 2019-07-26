/* eslint-disable global-require */
'use strict';
/**
 * Module Name: web
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $express = require('express');
require('./utility/express-async-errors');
const $morgan = require('morgan');
const $cookieParser = require('cookie-parser');
const $bodyParser = require('body-parser');
const $helmet = require('helmet');
const $compression = require('compression');

module.exports = meta => {
  $lf.$logger.silly('Start LinkFuture Web Boot');
  const beforeSetup = $lf._.get(meta, 'beforeSetup');
  const afterSetup = $lf._.get(meta, 'afterSetup');
  //global $lf injection
  global.$lf.$auth = require('./utility/auth');
  global.$lf.$siteInfo = require('./utility/siteinfo');

  //you should use $lf. after above injection
  //init auth model
  global.$lf.$md = require('./service/middleware');

  const $app = $express();
  if (beforeSetup) beforeSetup($app);
  setupApp();
  if (afterSetup) afterSetup($app);

  function boot() {
    if ($lf.$config.config.history) {
      $lf.$logger.silly(`enabled SAP mode`);
      const $history = require('connect-history-api-fallback');
      $app.use($history($lf.$config.config.history));
    }
    $app.use($express.static($lf.$config.webroot));
    require('./controller/page/error-page')($app);
    require('./utility/www')($app);
    $lf.$logger.silly(
      'Initialize LinkFuture Web Boot Success,you can access utility packages at global.$lf'
    );
    $lf.$logger.silly(
      `Utility packages include ${JSON.stringify(Object.keys($lf))}`
    );
  }
  function close() {
    $app.$server.close();
    $lf.$logger.silly('shut down express server');
  }
  function setupApp() {
    $app.use(
      $morgan((token, req, res) => {
        const statusCode = token.status(req, res) || 500;
        const time = token['response-time'](req, res);
        const url = token.url(req, res);
        const method = token.method(req, res);
        const timeString = time ? `${time}ms` : 'TIMEOUT';
        if (res.err || (statusCode && statusCode >= 500)) {
          $lf.$logger.error(
            `[API] [${statusCode}] [${timeString}] ${method} ${url}`,
            $lf._.get(res.err, 'message') || res.err
          );
        } else if (statusCode && statusCode >= 400) {
          $lf.$logger.warn(
            `[API] [${statusCode}] [${timeString}] ${method} ${url}`
          );
        } else {
          $lf.$logger.silly(
            `[API] [${statusCode}] [${timeString}] ${method} ${url}`
          );
        }
      })
    );
    $app.use($helmet($lf.$config.config.helmet));
    $app.use($compression());
    $app.use($bodyParser.json());
    $app.use($bodyParser.urlencoded({ extended: false }));
    $app.use($cookieParser());

    if ($lf.$auth.$meta.method) {
      $lf.$auth.init($app);
      require(`./controller/api/auth-${$lf.$auth.$meta.method}`)($app);
    }
    require('./controller/global.controller')($app);
    require('./controller/api/config')($app);
    require('./controller/api/proxy')($app);
    if ($lf.$config.config.mappings && $lf.$config.config.mappings.length > 0) {
      require(`./controller/mappings`)($app);
    }
  }

  return {
    boot,
    close,
    app: $app
  };
};
