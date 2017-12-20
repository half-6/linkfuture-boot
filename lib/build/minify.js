"use strict";
/**
 * Module Name: minify
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $compressor = require('node-minify');
const $fs = require('fs');
const $path = require('path');
const $glob = require('glob-promise');
const $encoding = 'utf8';
const buildType = {
    js:"js",
    css:"css",
    sql:"sql"
};
async function minifyJS(inputList,output,isMinify) {
    // JS
    //src/static/js/output/front-global.v1.min.js
    //src\static\js\output\front-global.v1.min.js
    //minify or just merge
    let compressor = isMinify?'uglifyjs':'no-compress';
    console.log(`minify ${output} with ${compressor} model`);
    await new Promise((resolve, reject)=>{
        $compressor.minify({
            compressor: compressor,
            input: inputList,
            output: output,
            options: {
              warnings: true, // pass true to display compressor warnings.
              mangle: false // pass false to skip mangling names.
            },
            callback: function (err, min) {
                if(err){
                    console.error(err);
                    reject(err)
                }
                else
                {
                    console.log(`minified ${output}`);
                    resolve()
                }
            }
        });
    })
}
async function minifyCSS(inputList,output,isMinify) {
    let compressor = isMinify?'clean-css':'no-compress';
    console.log(`minify ${output} with ${compressor} model`);
    await new Promise((resolve, reject)=>{
        $compressor.minify({
            compressor: compressor,
            input: inputList,
            output: output,
            callback: function (err, min) {
                if(err){
                    console.error(err);
                    reject(err)
                }
                else
                {
                    console.log(`minified ${output}`);
                    resolve()
                }
            }
        });
    })
}
async function mergeFiles(inputList,output) {
    console.log(`merging ${output}`);
    let dirName = $path.dirname(output);
    if (!$fs.existsSync(dirName)){
        $fs.mkdirSync(dirName);
    }
    await new Promise((resolve, reject)=>{
        const stream = $fs.createWriteStream(output,{flags: 'w', encoding: 'utf-8'});
        stream.on('open', function(fd) {
            inputList.forEach(file=>{
                console.log("reading ",file);
                let sql = $fs.readFileSync(file, $encoding);
                stream.write(sql + "\n");
            });
            stream.end();
            console.log(`merged ${output}`);
            resolve();
        });
    });
}
async function minify(config,type,isMinify){
    switch (type)
    {
        case buildType.js:
            await minifyJS(config.files,config.output,isMinify);
            break;
        case buildType.css:
            await minifyCSS(config.files,config.output,isMinify);
            break;
        case buildType.sql:
            await mergeFiles(config.files,config.output);
            break;
    }
}
async function build(buildFile,type,isMinify = true) {
    console.log(`*********** building ${buildFile} *************`);
    if(!$path.isAbsolute(buildFile))
    {
        buildFile = $path.join($lf.$config.root,buildFile);
    }
    const buildConfig = $lf.$util.readJson(buildFile);
    const baseDir = $path.dirname(buildFile);
    for (let key in buildConfig)
    {
        let item = buildConfig[key];
        let config = {
            output:item.output?$path.join(baseDir,item.output):null,
            files:[]
        };
        if(config.output)
        {
            let outputDir = $path.dirname(config.output);
            if(!$fs.existsSync(outputDir))
            {
                $lf.$logger.silly(`make dir ${outputDir} for minify output`);
                $fs.mkdirSync(outputDir);
            }
        }
        item.files.forEach((file)=>{
            //skip http url
            if(file.indexOf("//")>=0){
                return ;
            }
            if(file.indexOf("*")>0){
                let findFiles = $glob.sync($path.join(baseDir,file));
                findFiles.forEach((f)=>{
                    config.files.push(f);
                })
            }
            else
            {
                config.files.push( $path.join(baseDir,file));
            }
        });
        if(config.output)
        {
            await minify(config,type,isMinify);
        }
        else
        {
            for(let i in config.files)
            {
                let subFile = config.files[i];
                await minify({
                    files:subFile,
                    output:subFile
                },type,isMinify);
            }
        }
    }
}

module.exports ={
    build,
    buildType
}


