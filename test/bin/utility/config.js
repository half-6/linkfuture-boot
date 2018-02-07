/**
 * Created by zhangc01
 * on 1/9/2017.
 */


describe('Unit Test -- utility/config.js',function () {
    describe('config', ()=> {
        it('config', (done)=> {
            let config_dev = $lf.$config;
            $lf.$logger.silly(config_dev);
            $expect(config_dev.config.helmet).to.deep.equal({ frameguard: false });
	          $expect(config_dev.config.static.minify).equal(false);
            $expect(config_dev.$env).to.equal("dev");
            let config_prod = $lf.$config.readEnvConfig('prod', $meta);
            $lf.$logger.silly(config_prod);
            $expect(config_prod.config.static.minify).equal(true);
	          $expect(config_prod.$env).to.equal("prod");
            done();
        });
    });
});