"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAccessToken = exports.GITHUB_NEW_TOKEN_URL = exports.requiredGitHubTokenScopes = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const outvariant_1 = require("outvariant");
exports.requiredGitHubTokenScopes = [
    'repo',
    'admin:repo_hook',
    'admin:org_hook',
];
exports.GITHUB_NEW_TOKEN_URL = `https://github.com/settings/tokens/new?scopes=${exports.requiredGitHubTokenScopes.join(',')}`;
/**
 * Check whether the given GitHub access token has sufficient permissions
 * for this library to create and publish a new release.
 */
async function validateAccessToken(accessToken) {
    const response = await (0, node_fetch_1.default)('https://api.github.com', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const permissions = response.headers
        .get('x-oauth-scopes')
        ?.split(',')
        .map((scope) => scope.trim()) || [];
    // Handle generic error responses.
    (0, outvariant_1.invariant)(response.ok, 'Failed to verify GitHub token permissions: GitHub API responded with %d %s. Please double-check your "GITHUB_TOKEN" environmental variable and try again.', response.status, response.statusText);
    (0, outvariant_1.invariant)(permissions.length > 0, 'Failed to verify GitHub token permissions: GitHub API responded with an empty "X-OAuth-Scopes" header.');
    const missingScopes = exports.requiredGitHubTokenScopes.filter((scope) => {
        return !permissions.includes(scope);
    });
    if (missingScopes.length > 0) {
        (0, outvariant_1.invariant)(false, 'Provided "GITHUB_TOKEN" environment variable has insufficient permissions: missing scopes "%s". Please generate a new GitHub personal access token from this URL: %s', missingScopes.join(`", "`), exports.GITHUB_NEW_TOKEN_URL);
    }
}
exports.validateAccessToken = validateAccessToken;
//# sourceMappingURL=validateAccessToken.js.map