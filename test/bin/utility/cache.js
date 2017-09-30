/**
 * Created by zhangc01
 * on 1/9/2017.
 */


describe('Unit Test -- utility/cache.js',function () {
    describe('redis client', ()=> {
        let test_key = "TEST";
        let test_value = {a:1,b:2};

        it('redis', $async(async (done)=> {
            $lf.$cache.redis.set(test_key,test_value,1);
            let result = await $lf.$cache.redis.get(test_key);
            $expect(result).to.deep.equal(test_value);

            $lf.$cache.redis.del(test_key);
            result = await $lf.$cache.redis.get(test_key);
            (null==result).should.be.true;
            done();
        }));
        it('upset redis', $async(async (done)=> {
            let new_result = await $lf.$cache.redis.upsert(test_key,()=>{
                return test_value;
            },1);
            $expect(new_result).to.deep.equal(test_value);
            done();
        }));

        it('local', $async(async (done)=> {
            $lf.$cache.local.set(test_key,test_value,1);
            let result = await $lf.$cache.local.get(test_key);
            $expect(result).to.deep.equal(test_value);

            $lf.$cache.local.del(test_key);
            result = await $lf.$cache.local.get(test_key);
            (null==result).should.be.true;
            done();
        }));
        it('upset local', $async(async (done)=> {
            let new_result = await $lf.$cache.local.upsert(test_key,()=>{
                return test_value;
            },1);
            $expect(new_result).to.deep.equal(test_value);
            done();
        }));

        it('factory', $async( async (done)=> {
            $lf.$cache.factory.set(test_key,test_value,1);
            let result = await $lf.$cache.factory.get(test_key);
            $expect(result).to.deep.equal(test_value);

            $lf.$cache.factory.del(test_key);
            result = await $lf.$cache.factory.get(test_key);
            (null==result).should.be.true;
            done();
        }))
    });
});