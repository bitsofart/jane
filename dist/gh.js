"use strict";
exports.__esModule = true;
exports.getGhClient = exports.init = void 0;
var rest_1 = require("@octokit/rest");
var client;
function init() {
    client = new rest_1.Octokit({
        auth: process.env.GITHUB_TOKEN
    });
    return client;
}
exports.init = init;
function getGhClient() {
    if (!client) {
        return init();
    }
    return client;
}
exports.getGhClient = getGhClient;
