'use strict';
/**util
 * Module Name: siteinfo
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
const $path = require('path');
const $assert = require('assert');
const $fs = require('fs');
const $glob = require('glob-promise');

const $cache = $lf.$cache;
const $logger = $lf.$logger;
const $util = $lf.$util;
const $config = $lf.$config;
const _ = $lf._;

const $JS_Reference_Template = '<script src="{file_URL}"></script>';
const $CSS_Reference_Template = '<link href="{file_URL}" rel="stylesheet">';

const $defaultMeta = {
  minify: false,
  jsHttp: '/static/js/',
  cssHttp: '/static/css/',
  jsBuildFile: './src/webapp/static/js/build.json',
  cssBuildFile: './src/webapp/static/css/build.json'
};

const $meta = _.merge({}, $defaultMeta, _.get($config, 'config.static'));
$assert($meta, 'missing static setting');

function getJsBuild() {
  return $cache.local.upsert('jsBuildFile', () => {
    return $util.readJson($meta.jsBuildFile);
  });
}
function getCssBuild() {
  return $cache.local.upsert('cssBuildFile', () => {
    return $util.readJson($meta.cssBuildFile);
  });
}

function buildJSFiles(name) {
  const $jsBuild = getJsBuild();
  return $cache.local.upsert(
    `JS-Reference-Files-${name}-${$meta.minify}`,
    () => {
      if ($jsBuild[name]) {
        $logger.info('build inline js reference', name);
        const config = $jsBuild[name];
        return findFiles(config, $meta.jsHttp);
      } else {
        throw new Error(`Specific ${name} not exist`);
      }
    }
  );
}
function findFiles(config, baseUri) {
  const output = [];
  if ($meta.minify) {
    config.files.forEach(item => {
      if (item.indexOf('//') === 0) {
        append(item);
      }
    });
    append(buildUri(config.output, baseUri));
  } else {
    config.files.forEach(item => {
      append(buildUri(item, baseUri));
    });
  }
  function append(obj) {
    if (_.isArray(obj)) {
      obj.forEach(item => {
        append(item);
      });
    } else if (output.indexOf(obj) < 0) {
      output.push(obj);
    }
  }
  return output;
}
function buildJSInline(name) {
  return $cache.local.upsert(`JS-Reference-Inline-${name}`, () => {
    $logger.info('build js inline ', name);
    const files = buildJSFiles(name);
    const output = [];
    // eslint-disable-next-line no-unused-expressions
    files &&
      files.forEach(item => {
        output.push('<script language="javascript">');
        output.push(readFile(item));
        output.push('</script>');
      });
    return output.join('');
  });
}
function buildJSReference(name, isUnblock) {
  return $cache.local.upsert(`JS-Reference-${name}-${isUnblock}`, () => {
    $logger.info('build js reference', name);
    const files = buildJSFiles(name, $meta.jsHttp);
    const output = [];
    if (files) {
      if (!isUnblock) {
        files.forEach(item => {
          output.push($JS_Reference_Template.replace('{file_URL}', item));
        });
      } else {
        const unblockFiles = [];
        unblockFiles.push(...files);
        output.push(
          `<script language="javascript">$loadJS(${JSON.stringify(
            unblockFiles
          )}, function() {if (typeof globalInit !== "undefined") globalInit();})</script>`
        );
      }
    }
    return output.join('');
  });
}
function buildCSSReference(name) {
  const $cssBuild = getCssBuild();
  return $cache.local.upsert(`CSS-Reference-${name}`, () => {
    if ($cssBuild[name]) {
      $logger.info('build css reference', name);
      const config = $cssBuild[name];
      const files = findFiles(config, $meta.cssHttp);
      const output = [];
      // eslint-disable-next-line no-unused-expressions
      files &&
        files.forEach(item => {
          output.push($CSS_Reference_Template.replace('{file_URL}', item));
        });
      return output.join('');
    } else {
      throw new Error(`Specific ${name} not exist`);
    }
  });
}
function buildUri(file, baseUri) {
  if (file.indexOf('//') === 0) {
    return [file];
  }
  if (file.indexOf('*') > 0) {
    const files = $glob.sync($path.join($config.webroot, baseUri, file));
    const output = [];
    files.forEach(f => {
      output.push(f.substring($config.webroot.length - 1));
    });
    return output;
  }
  return [baseUri + file];
}

function readFile(fileName) {
  return $fs.readFileSync($path.join($config.webroot, fileName), 'utf8');
}

function getApiErrorOutput(res) {
  const output = {
    meta: {
      status: res.statusCode,
      timestamp: new Date()
        .toISOString()
        .split('T')
        .join(' '),
      message: res.err.message
    },
    response: null
  };
  if ($config.debug) output.meta.detail = res.err.stack;
  return output;
}
function getApiSuccessOutput(res, body) {
  const response = typeof body === 'string' ? JSON.parse(body) : body;
  return {
    meta: {
      status: res.statusCode,
      timestamp: new Date()
        .toISOString()
        .split('T')
        .join(' '),
      message: 'success'
    },
    response
  };
}
function responseApiErrorOutput(res) {
  return function(err) {
    res.status(400);
    res.err = err;
    res.json(getApiErrorOutput(res));
  };
}
function getIp(req) {
  let ip = (
    req.headers['x-forwarded-for'] || req.connection.remoteAddress
  ).split(',')[0];
  if (ip === '::1') ip = '127.0.0.1';
  return ip;
}

module.exports = {
  buildJSReference,
  buildCSSReference,
  buildJSInline,
  buildJSFiles,
  getApiErrorOutput,
  getApiSuccessOutput,
  responseApiErrorOutput,
  getIp,
  $meta
};
