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
    });
});