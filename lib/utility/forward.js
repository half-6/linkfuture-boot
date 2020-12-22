'use strict';
/**
 * Module Name: forward
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 10/05/2019
 */
const _ = $lf._;

module.exports = app => {
  /**
   * forward
   * @desc dynamic build api base on the request configuration
   * @param baseUrl api url, example: '/api/'
   * @param serviceConfig object of config, example:$lf.$config.config.service.test
   * @param forwardOption beforeForward:fun
   */
  function forward(baseUrl, serviceConfig, forwardOption) {
    const $request = $lf.$request.retry({ baseUrl: serviceConfig.baseUrl });
    _.forEach(serviceConfig, (v, k) => {
      if (k !== 'baseUrl') {
        const reqConfig = serviceConfig[k];
        if (_.get(reqConfig, 'apiForward', true)) {
          let methods =
            _.get(reqConfig, 'apiMethod') ||
            _.get(reqConfig, 'method') ||
            'GET';
          if (!Array.isArray(methods)) {
            methods = [methods];
          }
          methods.forEach(method => {
            const pathName = _.get(reqConfig, 'apiPath', _.kebabCase(k));
            const apiPath = `${baseUrl}/${pathName}`;
            const apiMethod = _.lowerCase(method);
            $lf.$logger.silly(
              `init forward services: ${_.upperCase(apiMethod)} ${apiPath} `
            );
            app[apiMethod](apiPath, handleRequest(apiPath, k));
          });
        }
      }
    });
    function handleRequest(apiPath, configName) {
      // noinspection JSUnusedLocalSymbols
      return async (req, res, next) => {
        //const results = await query(config, req.body, req.query);
        const option = _.cloneDeep(serviceConfig[configName]);
        option.body = _.merge({}, option.body, req.body);
        option.qs = _.merge({}, option.qs, req.query);
        // noinspection JSUnresolvedVariable
        if (forwardOption && forwardOption.beforeForward) {
          forwardOption.beforeForward(apiPath, configName, option, req);
        }
        const results = await $request(option);
        // noinspection JSUnresolvedVariable
        if (forwardOption && forwardOption.afterForward) {
          forwardOption.afterForward(apiPath, configName, option, req);
        }
        res.json(results);
      };
    }
  }

  /**
   * forward all request
   * @param baseUrl api url, example: '/api/'
   * @param option beforeForward:fun, AfterForward:fun
   */
  function forwardAll(baseUrl, option) {
    _.forEach($lf.$config.config.service, (serviceConfig, key) => {
      forward(`${baseUrl}/${_.kebabCase(key)}`, serviceConfig, option);
    });
  }
  return {
    forward,
    forwardAll
  };
};
