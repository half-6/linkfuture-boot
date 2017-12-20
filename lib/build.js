'use strict';
/**
 * Module Name: index
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */

const $minify = require('./build/minify');
const $childProcess = require('child_process');

module.exports = () => {
  $lf.$logger.silly('Start LinkFuture Build');
  return {
    build,
    buildJS,
    buildCSS,
    buildAPI,
    buildSQL
  };
};

async function buildJS(isMinify = true) {
  $lf.$logger.warn('*********** Start build JS *************');
  await $minify.build(
    $lf.$config.config.static.jsBuildFile,
    $minify.buildType.js,
    isMinify
  );
  $lf.$logger.warn('*********** End build JS *************');
}
async function buildCSS(isMinify = true) {
  $lf.$logger.warn('*********** Start build CSS *************');
  await $minify.build(
    $lf.$config.config.static.cssBuildFile,
    $minify.buildType.css,
    isMinify
  );
  $lf.$logger.warn('*********** End build CSS *************');
}

async function buildAPI() {
  $lf.$logger.warn('*********** Start build API Doc *************');
  const execAsync = Promise.promisify($childProcess.exec);
  const cmd = 'apidoc -i src/bin/controller/api/ -o src/webapp/doc';
  await execAsync(cmd);
  $lf.$logger.warn('*********** End build API *************');
}
async function buildSQL() {
  $lf.$logger.warn('*********** Start build SQL *************');
  // noinspection JSUnresolvedVariable
  await $minify.build(
    $lf.$config.config.static.sqlBuildFile,
    $minify.buildType.sql
  );
  $lf.$logger.warn('*********** End build SQL *************');
}

async function build(input, isMinify = true) {
  if (!input || input.length === 0) {
    await buildJS(isMinify);
    await buildCSS(isMinify);
    await buildAPI();
    await buildSQL();
  }
  input = $lf.$util.arrayToUpperCase(input);
  if (input.indexOf('JS') >= 0) await buildJS(isMinify);
  if (input.indexOf('CSS') >= 0) await buildCSS(isMinify);
  if (input.indexOf('API') >= 0) await buildAPI();
  if (input.indexOf('SQL') >= 0) await buildSQL();
}

//apidoc
// async function buildAPIDoc() {
//     $lf.$logger.warn("*********** Start build API Doc *************");
//     const exec = require('child_process').exec
//     const cmd = "apidoc -i src/bin/controller/api/ -o src/webapp/doc";
//     exec(cmd, function(error, stdout, stderr) {
//         if(error)
//         {
//             throw error;
//         }
//         if(stdout)
//         {
//             console.info(stdout);
//         }
//         // command output is in stdout
//         $lf.$logger.warn("*********** End build API *************");
//     });
//
// }
