'use strict';
/**
 * Module Name: global controller
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */
module.exports = app => {
  app.use((req, res, next) => {
    $lf.$logger.silly('Start LinkFuture Web Boot Global Controller');
    res.locals = {
      $siteInfo: $lf.$siteInfo,
      $config: $lf.$config,
      $user: req.user
    };
    req.getUrl = req.originalUrl || req.url;
    // req.on("end",function () {
    //     $logger.warn("request end");
    // });
    next();
  });
};
