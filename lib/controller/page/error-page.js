'use strict';
/**
 * Module Name: error page
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */
const $defaultMeta = {
  error400: 'error400',
  error500: 'error500'
};
const _ = $lf._;
module.exports = app => {
  const meta = _.merge({}, $defaultMeta, _.get($lf.$config, 'config.error'));
  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.statusCode = 404;
    next(err);
  });

  // error handler
  //noinspection JSUnusedLocalSymbols
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.status(err.statusCode || 500);

    res.locals.message = err.message;
    res.locals.error = $lf.$config.config.debug ? err : {};
    res.locals.statusCode = res.statusCode;
    // render the error page

    if (res.statusCode >= 500) {
      $lf.$logger.error('Unhandled exception', err);
      res.err = err;
      res.render(meta.error500);
    } else {
      $lf.$logger.warn(`specific page ${req.getUrl} not found`);
      res.render(meta.error400);
    }
  });
};
