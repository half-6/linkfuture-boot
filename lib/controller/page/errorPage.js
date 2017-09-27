/*
error page handler
404 and 500
* */
const $defaultMeta = {
    "error400":"error400",
    "error500":"error500"
};
const _ = require("lodash");
module.exports = app =>{
    const meta = _.merge({},$defaultMeta,_.get($lf.$config,"config.error"));
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        let err = new Error('Not Found');
        err.statusCode = 404;
        next(err);
    });

    // error handler
    //noinspection JSUnusedLocalSymbols
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.status(err.statusCode || 500);

        res.locals.message = err.message;
        res.locals.error = $lf.$config.debug  ? err : {};
        res.locals.statusCode = res.statusCode;
        // render the error page

        if(res.statusCode>=500) {
            $lf.$logger.error("exception", err);
            res.err = err;
            res.render(meta.error500);
        }
        else
        {
            $lf.$logger.warn(`specific page ${req.getUrl} not found`);
            res.render(meta.error400);
        }

    });
};