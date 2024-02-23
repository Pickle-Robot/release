"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitHubRelease = void 0;
const outvariant_1 = require("outvariant");
const node_fetch_1 = __importDefault(require("node-fetch"));
const getInfo_1 = require("../git/getInfo");
async function getGitHubRelease(tag) {
    const repo = await (0, getInfo_1.getInfo)();
    const response = await (0, node_fetch_1.default)(`https://api.github.com/repos/${repo.owner}/${repo.name}/releases/tags/${tag}`, {
        headers: {
            Accept: 'application/json',
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
    });
    if (response.status === 404) {
        return undefined;
    }
    (0, outvariant_1.invariant)(response.ok, 'Failed to fetch GitHub release for tag "%s": server responded with %d.\n\n%s', tag, response.status);
    return response.json();
}
exports.getGitHubRelease = getGitHubRelease;
//# sourceMappingURL=getGitHubRelease.js.map