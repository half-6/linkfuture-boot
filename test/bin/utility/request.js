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
    });
});