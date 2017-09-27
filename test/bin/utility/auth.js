/**
 * Module Name:
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/11/2017
 */

describe('Unit Test -- service/auth.js',function () {
    describe('auth service', ()=> {
        it('encoding and decoding', (done)=> {
            let user = {id:"myid",email:"test@hotmail.com",name:"nick name"};
            let token = $lf.$auth.encode(user);
            $lf.$logger.info("JWT token", token);
            // var waitTill = new Date(new Date().getTime() + 30 * 1000);
            // while(waitTill > new Date()){}
            let decodedUser = $lf.$auth.decode(token);
            $lf.$logger.info("Decoded User", JSON.stringify(decodedUser));
            //it will auto append iat during decode, so need append before compare
            user.iat = decodedUser.iat;
            user.exp = decodedUser.exp;
            user.iss = $lf.$config.config.auth.jwt.options.issuer;
            user.aud = $lf.$config.config.auth.jwt.options.audience;
            user.sub = $lf.$config.config.auth.jwt.options.subject;
            $expect(user).to.deep.equal(decodedUser);
            done();
        });
    });
});