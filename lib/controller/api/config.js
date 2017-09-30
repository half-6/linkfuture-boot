/**
 * Created by zhangc01
 * on 12/22/2016.
 */
const $passport = require('passport');
const $basicStrategy = require('passport-http').BasicStrategy;
const _ = require('lodash');
const $config = $lf.$config;
const $defaultMeta = {
    "username":"admin"
    ,"password":"qwer1234"
};
const $meta = _.get($config,"config.lf_admin",$defaultMeta);
module.exports = app=>{
    $passport.use(new $basicStrategy(
        function(username, password, done) {
            if (username.valueOf() === $meta.username &&
                password.valueOf() === $meta.password)
                return done(null, true);
            else
                return done(null, false);
        }
    ));
    app.get("/api/config",
        $passport.authenticate('basic', { session: false }),
        $lf.$md(
            {api:true}
        ),
        (req,res,next)=>{
            res.json({
            "config":$config.config,
            "env":process.env
        })
    })
};