"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const outvariant_1 = require("outvariant");
const getInfo_1 = require("../git/getInfo");
async function createComment(issueId, body) {
    const repo = await (0, getInfo_1.getInfo)();
    const response = await (0, node_fetch_1.default)(`https://api.github.com/repos/${repo.owner}/${repo.name}/issues/${issueId}/comments`, {
        method: 'POST',
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            body,
        }),
    });
    (0, outvariant_1.invariant)(response.ok, 'Failed to create GitHub comment for "%s" issue.', issueId);
}
exports.createComment = createComment;
//# sourceMappingURL=createComment.js.map