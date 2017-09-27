/**
 * Created by zhangc01
 * on 1/9/2017.
 */


describe('Unit Test -- utility/config.js',function () {
    describe('config', ()=> {
        it('config', (done)=> {
            process.env.NODE_ENV = "dev";
            let config_dev = require("./../../../lib/utility/config")($meta);
            $lf.$logger.silly(config_dev);
            $expect(config_dev.config.helmet).to.deep.equal({ frameguard: false });
            process.env.NODE_ENV = "prod";
            let config_prod = require("./../../../lib/utility/config")($meta);
            $lf.$logger.silly(config_prod);
            $expect(config_prod.config.static.minify).equal(true);
            done();
        });
    });
});