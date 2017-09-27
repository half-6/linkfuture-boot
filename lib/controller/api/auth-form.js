/**
 * Module Name:
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */

const $meta = $lf.$auth.$meta;

/**
  build auth
  @param app express app
 */
module.exports = app => {
    app.get($meta.logout, function(req, res){
        $lf.$logger.silly("auth-form logout");
        req.logout();
        res.redirect($meta.logoutSuccessURL);
    });
};

