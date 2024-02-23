"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demandNpmToken = exports.demandGitHubToken = void 0;
const outvariant_1 = require("outvariant");
const validateAccessToken_1 = require("./github/validateAccessToken");
async function demandGitHubToken() {
    const { GITHUB_TOKEN } = process.env;
    (0, outvariant_1.invariant)(GITHUB_TOKEN, 'Failed to publish the package: the "GITHUB_TOKEN" environment variable is not provided.');
    await (0, validateAccessToken_1.validateAccessToken)(GITHUB_TOKEN);
}
exports.demandGitHubToken = demandGitHubToken;
async function demandNpmToken() {
    const { NODE_AUTH_TOKEN, NPM_AUTH_TOKEN } = process.env;
    (0, outvariant_1.invariant)(NODE_AUTH_TOKEN || NPM_AUTH_TOKEN, 'Failed to publish the package: neither "NODE_AUTH_TOKEN" nor "NPM_AUTH_TOKEN" environment variables were provided.');
}
exports.demandNpmToken = demandNpmToken;
//# sourceMappingURL=env.js.map