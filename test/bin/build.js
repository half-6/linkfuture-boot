describe('Unit Test -- build.js',function () {
    describe('build', ()=> {
        it('build', (done)=> {
            let build = $lf_boot.build();
            build.build(["js"])
                .then($success("build",done))
                .catch($error("build",done))
        });
    });
});