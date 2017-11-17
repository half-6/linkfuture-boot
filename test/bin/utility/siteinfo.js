/**
 * Created by zhangc01
 * on 1/9/2017.
 */

describe('Unit Test -- utility/siteinfo.js',function () {
    describe('siteinfo', ()=> {
        it('buildReference', ()=> {
            let js = $lf.$siteInfo.buildJSReference("admin-global");
            $assert(js.length>0,"Can't find any js file");
            $lf.$logger.silly(js);
            let css = $lf.$siteInfo.buildCSSReference("admin-global");
            $assert(css.length>0,"Can't find any css file");
            $lf.$logger.silly(css);
        });
        it('buildReference unblocked', ()=> {
            let js = $lf.$siteInfo.buildJSReference("admin-global",true);
            $assert(js.length>0,"Can't find any js file");
            $lf.$logger.silly(js);
        });
        it('buildJSInline', ()=> {
            let js = $lf.$siteInfo.buildJSInline("admin-global");
            $assert(js.length>0,"Can't find any js file");
            $lf.$logger.silly(js);
        });
        it('buildJSFiles', ()=> {
            let js = $lf.$siteInfo.buildJSFiles("admin-global");
            $assert(js.length>0,"Can't find any js file");
            $lf.$logger.silly(js);
        });
    });
});