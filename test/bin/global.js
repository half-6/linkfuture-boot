/**
 * Created by zhangc01
 * on 1/9/2017.
 */
process.env.PORT = 4000;
process.env.DEBUG = "lf-boot";
// process.env.NODE_ENV = "prod";
global.$chai = require('chai');
global.$chaiHttp = require('chai-http');
const $path = require('path');
const $root = require('app-root-path').toString();
global.$meta = {
    "resourceroot":$path.join($root,`test/resource/`),
    "webroot":$path.join($root,`test/`)
};
global.$lf_boot = require('../../lib/index')($meta);
global.$lf_boot_web = $lf_boot.web();
global.$app = $lf_boot_web.app;

$chai.use($chaiHttp);
global.$should = $chai.should();
global.$assert = require('assert');
global.$expect = $chai.expect;

global.$async=function(fn)
{
    return (done) => {
        Promise
            .resolve(fn(done))
            .catch(done);
    };
};
//noinspection JSAnnotator
global.$boot = (done)=>{
    $lf_boot_web.boot();
    done();
};

global.$setGlobalAuth=(done)=>{
    // $chai.request($app)
    //     .post(`/api/login`)
    //     .send({username:"admin",password:"password"})
    //     .end(function (err,res) {
    //         (err == null).should.be.true;
    //         res.should.have.status(200);
    //         res.should.be.a.json;
    //         res.body.response.should.have.property('token');
    //         global.$token = res.body.response.token;
    //         $logger.info("Got JWT",global.$token);
    //         done();
    //     })
};
global.$unauthorizedVerify=(err,res)=>{
    (err != null).should.be.true;
    $lf.$logger.info(err.message);
    res.should.have.status(401);
};
global.$serverErrorVerify=(err,res)=>{
    (err != null).should.be.true;
    $lf.$logger.info(err.message);
    res.should.have.status(500);
};
global.$apiSuccessVerify=(err,res)=>{
    (err == null).should.be.true;
    $lf.$logger.silly(res.body);
    res.should.be.a.json;
    res.body.should.have.property('response');
    (res.body.meta.status == 200).should.be.true;
    res.should.have.status(200);
};
global.$error= function (name,done) {
    return function (err) {
        $lf.$logger.error(name,err);
        done();
    }
}
global.$success= function (name,done) {
    return function (err) {
        $lf.$logger.info(name,err);
        done();
    }
}



