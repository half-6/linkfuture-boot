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
   */
  function forward(baseUrl, serviceConfig) {
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
            const pathName = _.kebabCase(k);
            $lf.$logger.silly(
              `init forward services: ${_.upperCase(
                method
              )} ${baseUrl}/${pathName} `
            );
            app[method](`${baseUrl}/${pathName}`, handleRequest(k));
          });
        }
      }
    });
    function handleRequest(config) {
      return async (req, res, next) => {
        const results = await query(config, req.body, req.query);
        res.json(results);
      };
    }
    async function query(name, body, qs) {
      const option = _.cloneDeep(serviceConfig[name]);
      option.body = _.merge({}, option.body, body);
      option.qs = _.merge({}, option.qs, qs);
      return await $request(option);
    }
  }

  /**
   * forward all request
   * @param baseUrl api url, example: '/api/'
   */
  function forwardAll(baseUrl) {
    _.forEach($lf.$config.config.service, (serviceConfig, key) => {
      forward(`${baseUrl}/${_.kebabCase(key)}`, serviceConfig);
    });
  }
  return {
    forward,
    forwardAll
  };
};
