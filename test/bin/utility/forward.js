/**
 * Created by zhangc01
 * on 1/9/2017.
 */
/**
 * Created by zhangc01
 * on 1/9/2017.
 */
describe('Unit Test -- utility/forward.js',function () {
	const $requester = $chai.request.agent($app);
	after(() => $requester.app.close());
    describe('forward test', ()=> {
        it('get 200 success', (done)=> {
	        $requester
                .get(`/api/test/200`)
                .end(function (err,res) {
                    $apiSuccessVerify(err,res);
                    done();
                })
        });
        it('get 500 error', (done)=> {
            $requester
                .get(`/api/test/200?sleep=10000`)
                .end(function (err,res) {
                    $serverErrorVerify(err,res);
                    done();
                })
        });
        it('post 200 success', (done)=> {
            $requester
                .post(`/api/test/200`)
                .end(function (err,res) {
                    $apiSuccessVerify(err,res);
                    done();
                })
        });
        it('delete 200 success', (done)=> {
            $requester
                .delete(`/api/test/200`)
                .end(function (err,res) {
                    $server404Verify(err,res);
                    done();
                })
        });
        it('get 400 success', (done)=> {
            $requester
                .get(`/api/test/400`)
                .end(function (err,res) {
                    $server404Verify(err,res);
                    done();
                })
        });
    });
});