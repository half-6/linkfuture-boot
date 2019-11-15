/**
 * Module Name:
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/11/2017
 */

describe('Unit Test -- utility/util.js',function () {
    describe('promise retry', ()=> {
      let result = "AAA";
      let myError = new Error("DDD");
	    let myPromise = function (isSuccess) {
		    return new Promise((resolve, reject)=>{
			    isSuccess?resolve(result):reject(myError);
		    })
	    }
	    it('promise retry', $async(async (done)=> {
		    let r = await $lf.$util.myRetry({promise:myPromise(true)})
		    $lf.$logger.silly("done" + JSON.stringify(r));
		    (r==result).should.be.true;
		    done();
	    }));
	    it('promise retry with verify', $async(async (done)=> {
		    $lf.$util.myRetry({
			    promise:myPromise(false),
			    context:"unit test",
			    verify:(err,number)=>{
				    if(number>2)
					    return false
				    return true;
			    }
		    }).then(r=>{
			    throw new Error("promise tried failed")
		    })
			    .catch((err)=>{
				    $lf.$logger.warn(`retry failed as expected`);
				    (err==myError).should.be.true;
				    done();
		    })
	    }));
		it('promise all', $async(async (done)=> {
			let r = await $lf.$util.promiseAll(
				{
					r200:$lf.$repository.test.r200({qs:{a:1}}),
					r400:$lf.$repository.test.r400({qs:{a:1}}),
					successR200:$lf.$repository.success.r200({qs:{a:1}})
				},)
			$lf.$logger.silly("done" + JSON.stringify(r));
			(r.r200.code===200).should.be.true;
			(r.r400===undefined).should.be.true;
			(r.successR200.code===200).should.be.true;
			done();
		}));
		it('promise all error', $async(async (done,failed)=> {
			try{
				let r = await $lf.$util.promiseAll(
					{
						r200:$lf.$repository.test.r200({qs:{a:1}}),
						r400:$lf.$repository.test.r400({qs:{a:1}}),
					},false)
				failed("it should throw error")
			}
			catch (e) {
				$lf.$logger.silly("error" + JSON.stringify(e));
				done();
			}
		}));
    });
});