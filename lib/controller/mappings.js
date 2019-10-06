'use strict';
/**
 * Module Name: config api
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */
module.exports = app => {
  app.use((req, res, next) => {
    $lf.$logger.silly('Start URL mapping controller');
    const mapping = $lf.$auth.isUrlMatch(req.getUrl, req.method);
    if (mapping) {
      $lf.$md(mapping)(req, res, next);
    } else {
      //eslint-disable-next-line callback-return
      next();
    }
  });
};
