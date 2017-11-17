/**
 * Created by zhangc01
 * on 1/9/2017.
 */

describe('Unit Test -- utility/logger.js',function () {
    describe('logger', ()=> {
        let msg = "this is logger test";
        it('log', ()=> {
            $lf.$logger.log(msg,"log");
            $lf.$logger.debug(msg,"debug");
            $lf.$logger.silly(msg,"silly");
            $lf.$logger.verbose(msg,"verbose");
            $lf.$logger.info(msg,"info");
            $lf.$logger.warn(msg,"warn");
            $lf.$logger.error(msg,new Error("my error message"));
            $lf.$logger.error(msg,"error");
        });
    });
});