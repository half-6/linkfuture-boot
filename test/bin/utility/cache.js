/**
 * Created by zhangc01
 * on 1/9/2017.
 */


describe('Unit Test -- utility/cache.js',function () {
    describe('redis client', ()=> {
        let redis_key = "TEST";
        let redis_value = {a:1,b:2};
        it('setRedis', ()=> {
            $lf.$cache.setRedis(redis_key,redis_value,1);
        });
        it('getRedis', (done)=> {
            $lf.$cache.getRedis(redis_key)
                .then(r=>{
                    //$assert.deepEqual(r,redis_value);
                    $expect(r).to.deep.equal(redis_value);
                    //r.should.equal(redis_value);
                    done();
                })
                .catch(err=>{done(err)})
        })
    });
});