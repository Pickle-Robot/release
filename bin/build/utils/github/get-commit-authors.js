import { log } from "../../logger.js";
import { getInfo } from "../git/get-info.js";
import { format } from "outvariant";

//#region src/utils/github/get-commit-authors.ts
/**
* Get a list of GitHub usernames who have contributed
* to the given release commit. This analyzes all the commit
* authors in the pull request referenced by the given commit.
*/
async function getCommitAuthors(commit) {
	const issueRefs = /* @__PURE__ */ new Set();
	for (const ref of commit.references) if (ref.issue) issueRefs.add(ref.issue);
	if (issueRefs.size === 0) return /* @__PURE__ */ new Set();
	const repo = await getInfo();
	const queue = [];
	const authors = /* @__PURE__ */ new Set();
	function addAuthor(login) {
		if (!login) return;
		authors.add(login);
	}
	for (const issueId of issueRefs) {
		const authorLoginPromise = new Promise(async (resolve, reject) => {
			const response = await fetch(`https://api.github.com/graphql`, {
				method: "POST",
				headers: {
					Agent: "ossjs/release",
					Accept: "application/json",
					Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
					"Content-Type": "application/json"
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
						pullRequestId: Number(issueId)
					}
				})
			});
			if (!response.ok) return reject(new Error(format("GitHub API responded with %d.", response.status)));
			const json = await response.json();
			const data = json.data;
			if (json.errors) return reject(new Error(format("GitHub API responded with %d error(s): %j", json.errors.length, json.errors)));
			addAuthor(data.repository.pullRequest.author.login);
			for (const commit$1 of data.repository.pullRequest.commits.nodes) for (const author of commit$1.commit.authors.nodes)
 /**
			* @note In some situations, GitHub will return "user: null"
			* for the commit user. Nobody to add to the authors then.
			*/
			if (author.user != null) addAuthor(author.user.login);
			resolve();
		});
		queue.push(authorLoginPromise.catch((error) => {
			log.error(format("Failed to extract the authors for the issue #%d:", issueId, error.message));
		}));
	}
	await Promise.allSettled(queue);
	return authors;
}

//#endregion
export { getCommitAuthors };