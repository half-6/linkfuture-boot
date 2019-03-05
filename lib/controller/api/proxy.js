/* eslint-disable max-nested-callbacks */
'use strict';
/**
 * Module Name: proxy
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 9/23/2017
 */
const $url = require('url');
module.exports = app => {
  const _ = $lf._;
  _.each($lf.$config.config.proxy, item => {
    $lf.$logger.silly(
      `init proxy services: ${item.url} => ${item.forwardBaseUrl}`
    );
    app.all(
      item.url,
      $lf.$util.async(async (req, res, next) => {
        const requestUrl = new $url.URL(
          _.get(req, 'params[0]') ? _.get(req, 'params[0]') : '',
          item.forwardBaseUrl
        ).href;
        $lf.$logger.silly(`forward request to ${requestUrl}`);
        const headers = _.pick(req.headers, [
          'accept',
          'content-type',
          'accept-encoding',
          'content-length',
          'user-agent',
          'x-forward-host'
        ]);
        _.merge(headers, item.headers);
        const body =
          !req.body || Object.keys(req.body).length === 0
            ? undefined
            : req.body;
        _.merge(body, item.body);
        const qs = _.merge(req.query, item.query);
        $lf.$request
          .retry()({
            uri: requestUrl,
            resolveWithFullResponse: true,
            qs,
            method: req.method,
            body,
            headers
          })
          .then(response => {
            res.status(response.statusCode);
            _.chain(response)
              .get('headers')
              .omit([
                'server',
                'x-content-type-options',
                'x-frame-options',
                'x-xss-protection'
              ])
              .forOwn((value, key) => {
                res.header(key, value);
              })
              .value();
            res.send(response.body);
          })
          .catch(err => {
            res.status(500);
            res.err = err;
            res.json($lf.$siteInfo.getApiErrorOutput(res));
          });
      })
    );
  });
};
