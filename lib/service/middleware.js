'use strict';
/**
 * Module Name: middle ware for injection and auth
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 7/17/2017
 */
const _ = require('lodash');
const $defaultMeta = {
  min: 0,
  key(req) {
    return `${req.method}_${req.getUrl}`;
  },
  api: false,
  auth: false,
  roles: null //array for required roles, make sure req.user.roles = []
};

function buildResponse(meta, key, res) {
  res.sendResponse = res.send;
  res.send = body => {
    res.send = res.sendResponse;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const output = meta.api
        ? $lf.$siteInfo.getApiSuccessOutput(res, body)
        : body;
      if (meta.store) {
        $lf.$cache.factory.set(key, output, meta.min);
      }
      return res.send(output);
    } else {
      if (meta.api && res.statusCode >= 500) {
        return res.json($lf.$siteInfo.getApiErrorOutput(res));
      }
      return res.send(body);
    }
  };
}

// eslint-disable-next-line max-statements
async function bind(input, req, res, next) {
  const meta = _.merge({}, $defaultMeta, input);
  res.meta = meta;
  const key = meta.key(req);
  //authenticate
  if (meta.auth && !$lf.$auth.hasAccess(req, meta.roles)) {
    $lf.$logger.warn(`Unauthenticated user access${req.getUrl}`);
    if (meta.api) {
      res.status(401);
      res.err = new Error('Unauthenticated');
      res.json($lf.$siteInfo.getApiErrorOutput(res));
      return;
    } else {
      res.redirect($lf.$auth.getLoginUrl(req.getUrl));
      return;
    }
  }

  //force fetch cache
  if (req.headers['x-api-cache-force-fetch'] || meta.min <= 0) {
    $lf.$logger.silly('force or no cache request');
    //add header for api only
    if (meta.api) {
      meta.store = false;
      buildResponse(meta, key, res);
    }
    next();
    return;
  }

  //add response cache, only add cache for unauth page
  if (!meta.auth) {
    res.header({
      'cache-control': `public, max-age=${meta.min * 60}`
    });
  }
  const result = await $lf.$cache.factory.get(key);
  if (result) {
    res.send(result);
  } else {
    $lf.$logger.silly(`no cache found for this page ${key}`);
    meta.store = true;
    buildResponse(meta, key, res);
    // eslint-disable-next-line callback-return
    next();
  }
}
module.exports = meta => {
  return $lf.$util.async(async (req, res, next) => {
    return await bind(meta, req, res, next);
  });
};
