/**
 * Created by cyokin
 * on 1/9/2017.
 */
/*global controler*/
module.exports = app=>{
    app.use(function (req, res, next) {
        $lf.$logger.silly("LF global controller");
        res.locals = {
            $siteInfo:$lf.$siteInfo,
            $config:$lf.$config,
            $user:req.user
        };
        req.getUrl = req.originalUrl || req.url;
        // req.on("end",function () {
        //     $logger.warn("request end");
        // });
        next();
    });
};
