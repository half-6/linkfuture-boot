'use strict';
/**
 * Module Name: config api
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */
const _ = require('lodash');
const $config = _.get($lf.$config, 'config.mappings');
module.exports = app => {
  app.use((req, res, next) => {
    $lf.$logger.silly('Start URL mapping controller');
    const mapping = isUrlMatch(req.getUrl, req.method);
    if (mapping) {
      $lf.$md(mapping, req, res, next);
    } else {
      //eslint-disable-next-line callback-return
      next();
    }
  });

  function isUrlMatch(url, httpMethod) {
    if ($config) {
      for (const i in $config) {
        const mapping = $config[i];
        if (
          new RegExp(mapping.pattern).exec(url) &&
          (!httpMethod ||
            !mapping.method ||
            $lf._.some(
              mapping.method,
              item => item.toLowerCase() === httpMethod.toLowerCase()
            ))
        ) {
          return mapping;
        }
      }
    }
    return undefined;
  }
};
