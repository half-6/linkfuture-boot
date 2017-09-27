describe('Unit Test -- build.js',function () {
    describe('build', ()=> {
        it('build', (done)=> {
            let build = require("./../../lib/build")($meta);
            build.build(["js"])
                .then($success("build",done))
                .catch($error("build",done))
        });
    });
});