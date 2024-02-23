"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitAuthors = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const outvariant_1 = require("outvariant");
const getInfo_1 = require("../../utils/git/getInfo");
const logger_1 = require("../../logger");
/**
 * Get a list of GitHub usernames who have contributed
 * to the given release commit. This analyzes all the commit
 * authors in the pull request referenced by the given commit.
 */
async function getCommitAuthors(commit) {
    // Extract all GitHub issue references from this commit.
    const issueRefs = new Set();
    for (const ref of commit.references) {
        if (ref.issue) {
            issueRefs.add(ref.issue);
        }
    }
    if (issueRefs.size === 0) {
        return new Set();
    }
    const repo = await (0, getInfo_1.getInfo)();
    const queue = [];
    const authors = new Set();
    function addAuthor(login) {
        if (!login) {
            return;
        }
        authors.add(login);
    }
    for (const issueId of issueRefs) {
        const authorLoginPromise = new Promise(async (resolve, reject) => {
            const response = await (0, node_fetch_1.default)(`https://api.github.com/graphql`, {
                method: 'POST',
                headers: {
                    Agent: 'ossjs/release',
                    Accept: 'application/json',
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
            query GetCommitAuthors($owner: String!, $repo: String!, $pullRequestId: Int!) {
              repository(owner: $owner name: $repo) {
                pullRequest(number: $pullRequestId) {
                  url
                  author {
                    login
                  }
                  commits(first: 100) {
                    nodes {
                      commit {
                        authors(first: 100) {
                          nodes {
                            user {
                              login
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            `,
                    variables: {
                        owner: repo.owner,
                        repo: repo.name,
                        pullRequestId: Number(issueId),
                    },
                }),
            });
            if (!response.ok) {
                return reject(new Error((0, outvariant_1.format)('GitHub API responded with %d.', response.status)));
            }
            const json = await response.json();
            const data = json.data;
            if (json.errors) {
                return reject(new Error((0, outvariant_1.format)('GitHub API responded with %d error(s): %j', json.errors.length, json.errors)));
            }
            // Add pull request author.
            addAuthor(data.repository.pullRequest.author.login);
            // Add each commit author in the pull request.
            for (const commit of data.repository.pullRequest.commits.nodes) {
                for (const author of commit.commit.authors.nodes) {
                    /**
                     * @note In some situations, GitHub will return "user: null"
                     * for the commit user. Nobody to add to the authors then.
                     */
                    if (author.user != null) {
                        addAuthor(author.user.login);
                    }
                }
            }
            resolve();
        });
        queue.push(authorLoginPromise.catch((error) => {
            logger_1.log.error((0, outvariant_1.format)('Failed to extract the authors for the issue #%d:', issueId, error.message));
        }));
    }
    // Extract author GitHub handles in parallel.
    await Promise.allSettled(queue);
    return authors;
}
exports.getCommitAuthors = getCommitAuthors;
//# sourceMappingURL=getCommitAuthors.js.map