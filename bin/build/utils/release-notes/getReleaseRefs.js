"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReleaseRefs = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const issue_parser_1 = __importDefault(require("issue-parser"));
const getInfo_1 = require("../git/getInfo");
const parser = (0, issue_parser_1.default)('github');
function extractIssueIds(text, repo) {
    const ids = new Set();
    const parsed = parser(text);
    for (const action of parsed.actions.close) {
        if (action.slug == null || action.slug === `${repo.owner}/${repo.name}`) {
            ids.add(action.issue);
        }
    }
    return ids;
}
async function getReleaseRefs(commits) {
    const repo = await (0, getInfo_1.getInfo)();
    const issueIds = new Set();
    for (const commit of commits) {
        // Extract issue ids from the commit messages.
        for (const ref of commit.references) {
            if (ref.issue) {
                issueIds.add(ref.issue);
            }
        }
        // Extract issue ids from the commit bodies.
        if (commit.body) {
            const bodyIssueIds = extractIssueIds(commit.body, repo);
            bodyIssueIds.forEach((id) => issueIds.add(id));
        }
    }
    // Fetch issue detail from each issue referenced in the commit message
    // or commit body. Those may include pull request ids that reference
    // other issues.
    const issuesFromCommits = await Promise.all(Array.from(issueIds).map(fetchIssue));
    // Extract issue ids from the pull request descriptions.
    for (const issue of issuesFromCommits) {
        // Ignore regular issues as they may not close/fix other issues
        // by reference (at least on GitHub).
        if (!issue.pull_request || !issue.body) {
            continue;
        }
        const descriptionIssueIds = extractIssueIds(issue.body, repo);
        descriptionIssueIds.forEach((id) => issueIds.add(id));
    }
    return issueIds;
}
exports.getReleaseRefs = getReleaseRefs;
async function fetchIssue(id) {
    const repo = await (0, getInfo_1.getInfo)();
    const response = await (0, node_fetch_1.default)(`https://api.github.com/repos/${repo.owner}/${repo.name}/issues/${id}`, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    });
    const resource = (await response.json());
    return resource;
}
//# sourceMappingURL=getReleaseRefs.js.map