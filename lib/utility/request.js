'use strict';
/**
 * Module Name: request-retry
 * Project Name: LinkFuture.Boot
 * Created by Cyokin on 1/11/2018
 */
const $baseRequest = require('request-promise');
const $promiseRetry = require('promise-retry');
const $requestError = require('request-promise/errors').RequestError;
const $retryCodes = ['ECONNRESET', 'ETIMEDOUT'];
const $defaultOptions = {
  retries: 4,
  minTimeout: 100,
  maxTimeout: 1000,
  randomize: true
};

/**
 * request retry
 * @param baseUrl(optional)
 * @param retryOptions(optional)
 * @return {Function}
 */
function requestRetry(baseUrl, retryOptions) {
  const requestPromise = baseUrl
    ? $baseRequest.defaults({ baseUrl })
    : $baseRequest;
  retryOptions = $lf._.merge($defaultOptions, retryOptions);
  return function(options) {
    return $promiseRetry(retry => {
      $lf.$logger.silly(
        `request ${JSON.stringify(options)} ${
          baseUrl ? `with baseUrl:${baseUrl}` : ''
        }, retry options: ${JSON.stringify(retryOptions)}`
      );
      return requestPromise(options).catch($requestError, err => {
        if (err.cause) {
          $lf.$logger.warn(`retry with error code ${err.cause.code}`);
          const retryable = $retryCodes.indexOf(err.cause.code) >= 0;
          if (retryable) {
            return retry(err);
          }
        }
        throw err;
      });
    }, retryOptions);
  };
}
module.exports = {
  retry: requestRetry
};
