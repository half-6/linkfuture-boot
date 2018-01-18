/**
 * Created by zhangc01
 * on 1/9/2017.
 */


describe('Unit Test -- utility/request.js',function () {
    describe('request', ()=> {
        it('request no base url', $async(async (done)=> {
            let r = await $lf.$request.retry()({
	            url:"http://www.google.com",
	            "method": "GET",
            })
	          $lf.$logger.silly(JSON.stringify(r));
            done();
        }));
        it('request with base url', $async(async (done)=> {
            let r = await $lf.$request.retry("http://www.google.com")({
              url:"/",
              "method": "GET",
            })
	          $lf.$logger.silly(JSON.stringify(r));
            done();
          }));
        it('request with options', $async(async (done)=> {
          let r = await $lf.$request.retry("http://www.google.com",{retries:2})({
            url:"/",
            "method": "GET",
          })
          $lf.$logger.silly(JSON.stringify(r));
          done();
        }));
	    it('request with failed', $async(async (done)=> {
		    $lf.$request.retry("http://hibu.dashboard.int")({
			    url:"/",
			    "method": "GET",
		    }).then(r=>{
			    throw new Error("promise tried failed")
		    }).catch((err)=>{
				    $lf.$logger.warn(`retry failed as expected`);
				    $lf.$logger.warn(err);
				    (err.cause.code=="ENOTFOUND").should.be.true;
				    done();
			    })
	    }));
    });
});