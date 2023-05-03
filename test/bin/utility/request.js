/**
 * Created by zhangc01
 * on 1/9/2017.
 */


describe('Unit Test -- utility/request.js',function () {
    function verifyResult(r){
        $lf.$logger.silly(JSON.stringify(r));
        $chai.assert(r.body.length > 0, "body is null");
        $chai.assert(r.statusCode === 200, "statusCode must 200");
    }
    describe('request', ()=> {
        it('request detail', $async(async (done)=> {
            let r = await $lf.$request.retryDetail()({
                url:"http://www.google.com",
                "method": "GET",
            })
            verifyResult(r)
            done();
        }));
        it('request directly', $async(async (done)=> {
            let r = await $lf.$request({
                url:"http://www.google.com",
                "method": "GET",
            })
            $lf.$logger.silly(JSON.stringify(r));
            done();
        }));
        it('request no base url', $async(async (done)=> {
            let r = await $lf.$request.retry()({
	            url:"http://www.google.com",
	            "method": "GET",
            })
            $lf.$logger.silly(JSON.stringify(r));
            done();
        }));
        it('request with global options', $async(async (done)=> {
            let r = await $lf.$request.retry({baseUrl:"http://www.google.com"})({
              url:"/",
              "method": "GET",
            })
            $lf.$logger.silly(JSON.stringify(r));
            done();
          }));
        it('request with string based global options', $async(async (done)=> {
            let r = await $lf.$request.retry("http://www.google.com")({
                url:"/",
                "method": "GET",
            })
            $lf.$logger.silly(JSON.stringify(r));
            done();
        }));
        it('request with retry options', $async(async (done)=> {
          let r = await $lf.$request.retry({baseUrl:"http://www.google.com"},{retries:2})({
            url:"/",
            "method": "GET",
          })
            $lf.$logger.silly(JSON.stringify(r));
          done();
        }));
	    it('request with failed', $async(async (done)=> {
		    $lf.$request.retry({baseUrl:"http://hibu.dashboard.int"})({
			    url:"/",
			    "method": "GET",
		    }).then(r=>{
			    throw new Error("promise tried failed")
		    }).catch((err)=>{
				    $lf.$logger.warn(`retry failed as expected`);
				    //$lf.$logger.warn(err);
				    (err.cause.code==="ENOTFOUND").should.be.true;
				    done();
			    })
	    }));
        it('request with 500', $async(async (done,failed)=> {
            $lf.$request.retry({baseUrl:"https://httpstat.us"})({
                url:"/500",
                "method": "GET",
            }).then(r=>{
                failed("promise tried failed")
            }).catch((err)=>{
                $lf.$logger.warn(`500 failed as expected`);
                done();
            })
        }));
        it('request with 400', $async(async (done,failed)=> {
            $lf.$request.retry({baseUrl:"https://httpstat.us"})({
                url:"/400",
                "method": "GET",
            }).then(r=>{
                failed("promise tried failed")
            }).catch((err)=>{
                $lf.$logger.warn(`400 failed as expected`);
                done();
            })
        }));
        it('repositories', $async(async (done,failed)=> {
            const repositories = $lf.$request.repositories();
            $assert(repositories.test.r400.constructor.name === "AsyncFunction")
            $assert(repositories.test.r200.constructor.name === "AsyncFunction")
            done();
        }));
        it('repository', $async(async (done,failed)=> {
            const repositories = $lf.$request.repository($lf.$config.config.service.test);
            $assert(repositories.r400.constructor.name === "AsyncFunction")
            $assert(repositories.r200.constructor.name === "AsyncFunction")
            done();
        }));
        it('global repositories', $async(async (done,failed)=> {
            const repositories = $lf.$repository;
            $assert(repositories.test.r400.constructor.name === "AsyncFunction")
            $assert(repositories.test.r200.constructor.name === "AsyncFunction")
            done();
        }));
    });
});