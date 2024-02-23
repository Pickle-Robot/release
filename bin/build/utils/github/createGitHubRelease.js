"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGitHubRelease = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const outvariant_1 = require("outvariant");
const logger_1 = require("../../logger");
/**
 * Create a new GitHub release with the given release notes.
 * @return {string} The URL of the newly created release.
 */
async function createGitHubRelease(context, notes) {
    const { repo } = context;
    logger_1.log.info((0, outvariant_1.format)('creating a new GitHub release at "%s/%s"...', repo.owner, repo.name));
    const response = await (0, node_fetch_1.default)(`https://api.github.com/repos/${repo.owner}/${repo.name}/releases`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tag_name: context.nextRelease.tag,
            name: context.nextRelease.tag,
            body: notes,
        }),
    });
    if (response.status === 401) {
        throw new Error('Failed to create a new GitHub release: provided GITHUB_TOKEN does not have sufficient permissions to perform this operation. Please check your token and update it if necessary.');
    }
    if (response.status !== 201) {
        throw new Error((0, outvariant_1.format)('Failed to create a new GitHub release: GitHub API responded with status code %d.', response.status, await response.text()));
    }
    return response.json();
}
exports.createGitHubRelease = createGitHubRelease;
//# sourceMappingURL=createGitHubRelease.js.map