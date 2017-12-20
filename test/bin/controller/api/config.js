/**
 * Created by zhangc01
 * on 1/9/2017.
 */
/**
 * Created by zhangc01
 * on 1/9/2017.
 */
describe('Unit Test -- controller/api/config.js',function () {
    describe('config api', ()=> {
        it('get auth success', (done)=> {
            $chai.request($app)
                .get(`/api/config`)
                .auth($lf.$config.config.lf_admin.username, $lf.$config.config.lf_admin.password)
                .end(function (err,res) {
                    $apiSuccessVerify(err,res);
                    done();
                })
        });
        it('get auth error', (done)=> {
            $chai.request($app)
                .get(`/api/config`)
                .end(function (err,res) {
                    $unauthorizedVerify(err,res);
                    done();
                })
        });
    });
});