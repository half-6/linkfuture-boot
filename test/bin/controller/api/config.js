/**
 * Created by zhangc01
 * on 1/9/2017.
 */
/**
 * Created by zhangc01
 * on 1/9/2017.
 */
describe('Unit Test -- controller/api/config.js',function () {
	  const $requester = $chai.request.agent($app);
	  after(() => $requester.app.close());
    describe('config api', ()=> {
        it('get auth success', (done)=> {
            let myHeadKey="some_custom_attribute";
            let myHeadValue="some_value";
	        $requester
                .get(`/api/config`)
                .set(myHeadKey, myHeadValue)
                .auth($lf.$config.config.lf_admin.username, $lf.$config.config.lf_admin.password)
                .end(function (err,res) {
                    res.body.response.should.have.property("memory")
                    res.body.response.should.have.property("config")
                    res.body.response.should.have.property("env")
                    res.body.response.should.have.property("header")
                    $assert(res.body.response.header[myHeadKey] === myHeadValue);
                    $apiSuccessVerify(err,res);
                    done();
                })
        });
        it('get auth error', (done)=> {
	        $requester
                .get(`/api/config`)
                .end(function (err,res) {
                    $unauthorizedVerify(res.error,res);
                    done();
                })
        });
    });
});