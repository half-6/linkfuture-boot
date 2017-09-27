"use strict";
/**
 * Module Name: index
 * Project Name: LinkFuture.NodeJS
 * Created by Cyokin on 1/10/2017
 */
module.exports = {

    web:(meta)=>{
        return require("./web")(meta);
    },
    build:(meta)=>{
        return require("./build")(meta);
    },
};