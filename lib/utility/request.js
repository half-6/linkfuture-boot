'use strict';
/**
 * Module Name: request-retry
 * Project Name: LinkFuture.Boot
 * Created by Cyokin on 1/11/2018
 */
const $baseRequest = require('request-promise');
const $promiseRetry = require('promise-retry');
const $requestError = require('request-promise/errors').RequestError;
const $statusError = require('request-promise/errors').StatusCodeError;
const $retryCodes = [
  'ECONNRESET',
  'ENOTFOUND',
  'ESOCKETTIMEDOUT',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EHOSTUNREACH',
  'EPIPE',
  'EAI_AGAIN'
];
const $defaultRetryOptions = $lf._.merge(
  {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 3000,
    randomize: true
  },
  $lf.$config.config.retryOptions
);
const $defaultRequestOptions = $lf._.merge(
  {
    timeout: 15000,
    resolveWithFullResponse: true
  },
  $lf.$config.config.requestOptions
);

/**
 * request retry
 * @param globalOptions(optional) i.e (baseUrl)
 * @param retryOptions(optional)
 * @return {Function}
 */
function requestRetry(globalOptions, retryOptions) {
  const requestPromise = globalOptions
    ? $baseRequest.defaults(globalOptions)
    : $baseRequest;
  retryOptions = $lf._.merge({}, $defaultRetryOptions, retryOptions);
  return function(options) {
    options = $lf._.merge({}, $defaultRequestOptions, options);
    const hrStart = process.hrtime();
    const httpMethod = $lf._.get(options, 'method');
    const url =
      $lf._.get(globalOptions, 'baseUrl', '') + $lf._.get(options, 'url');
    const requestDetail =
      httpMethod !== 'GET' ? ` with ${JSON.stringify(options)}` : '';
    $lf.$logger.silly(
      `[REQUEST] ${httpMethod} ${url} ${
        globalOptions ? `with ${JSON.stringify(globalOptions)}` : ''
      }`
    );
    return $promiseRetry((retry, number) => {
      return requestPromise(options)
        .then(response => {
          const statusCode = $lf._.get(response, 'statusCode', 500);
          const time = $lf.$util.getEndTime(hrStart);
          $lf.$logger.silly(
            `[REQUEST] [${statusCode}] [${time}] ${httpMethod} ${url} `
          );
          return $lf._.get(response, 'body');
        })
        .catch($statusError, response => {
          const statusCode = $lf._.get(response, 'statusCode');
          const time = $lf.$util.getEndTime(hrStart);
          $lf.$logger.error(
            `[REQUEST] [${statusCode}] [${time}] ${httpMethod} ${url} ${requestDetail}`
          );
          throw response;
        })
        .catch($requestError, err => {
          if (err.cause) {
            const time = $lf.$util.getEndTime(hrStart);
            const retryable = $retryCodes.indexOf(err.cause.code) >= 0;
            if (retryable) {
              const retries = $lf._.get(retryOptions, 'retries');
              if (number > retries) {
                const errorMessage = $lf._.get(err, 'message');
                $lf.$logger.error(
                  `[REQUEST] [${time}] ${httpMethod} ${url} ${requestDetail}, ${errorMessage}`
                );
              } else {
                $lf.$logger.warn(
                  `[REQUEST] [RETRY:${number}] ${httpMethod} ${url} error: ${
                    err.cause.code
                  }`
                );
              }
              return retry(err);
            } else {
              $lf.$logger.error(
                `[REQUEST] [${time}] ${httpMethod} ${url} ${requestDetail}`,
                err
              );
            }
          } else {
            const time = $lf.$util.getEndTime(hrStart);
            $lf.$logger.error(
              `[REQUEST] [${time}] ${httpMethod} ${url} ${requestDetail}`,
              err
            );
          }
          throw err;
        });
    }, retryOptions);
  };
}
const output = requestRetry();
output.retry = requestRetry;
module.exports = output;
