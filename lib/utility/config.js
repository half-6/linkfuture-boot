'use strict';
/**
 * Module Name: config
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $debugger = require('debug')('lf-boot');
const $path = require('path');
const $fs = require('fs');
const _ = require('lodash');
const $util = require('./util');
const $root = require('app-root-path').toString();
const constants = {
  KEY_DEV: 'dev',
  KEY_PROD: 'prod'
};
const $defaultMeta = {
  readEnvConfig,
  root: $root,
  resourceroot: $path.join($root, `src/resource/`),
  webroot: $path.join($root, `src/webapp/`)
};
function readConfig(filePath) {
  let configPath = `${filePath}.json`;
  if ($fs.existsSync(configPath)) {
    $debugger(`Reading ${configPath} config file`);
    return $util.readJson(configPath);
  }
  configPath = `${filePath}.js`;
  if ($fs.existsSync(configPath)) {
    $debugger(`Reading ${configPath} config file`);
    // eslint-disable-next-line global-require
    return require(configPath);
  }
  return null;
}
function readEnvConfig(env, meta) {
  meta = _.merge({ $env: env }, $defaultMeta, meta);
  $debugger(`Reading config as ${env} environment`);
  //read default config
  const defaultConfigFile = `${meta.resourceroot}config`;
  let config = readConfig(defaultConfigFile);
  if (!config)
    throw new Error(`Specific ${defaultConfigFile} file not exist yet`);

  //read env config
  const envConfigFile = `${meta.resourceroot}config.${env}`;
  const envConfig = readConfig(envConfigFile);
  // eslint-disable-next-line no-unused-expressions
  envConfig && (config = _.merge(config, envConfig));
  config.debug = $util.isNil(
    config.debug,
    process.env.NODE_ENV !== constants.KEY_PROD
  );
  return _.merge({}, meta, {
    config
  });
}
module.exports = meta => {
  process.env.NODE_ENV = (process.env.NODE_ENV || constants.KEY_DEV).trim();
  return readEnvConfig(process.env.NODE_ENV, meta);
};
