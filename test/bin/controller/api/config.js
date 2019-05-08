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
	        $requester
                .get(`/api/config`)
                .auth($lf.$config.config.lf_admin.username, $lf.$config.config.lf_admin.password)
                .end(function (err,res) {
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