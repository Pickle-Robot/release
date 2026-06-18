import { getInfo } from "../git/get-info.js";
import createIssueParser from "issue-parser";

//#region src/utils/release-notes/get-release-refs.ts
const parser = createIssueParser("github");
function extractIssueIds(text, repo) {
	const ids = /* @__PURE__ */ new Set();
	const parsed = parser(text);
	for (const action of parsed.actions.close) if (action.slug == null || action.slug === `${repo.owner}/${repo.name}`) ids.add(action.issue);
	return ids;
}
async function getReleaseRefs(commits) {
	const repo = await getInfo();
	const issueIds = /* @__PURE__ */ new Set();
	for (const commit of commits) {
		for (const ref of commit.references) if (ref.issue) issueIds.add(ref.issue);
		if (commit.body) extractIssueIds(commit.body, repo).forEach((id) => issueIds.add(id));
	}
	const issuesFromCommits = await Promise.all(Array.from(issueIds).map(fetchIssue));
	for (const issue of issuesFromCommits) {
		if (!issue.pull_request || !issue.body) continue;
		extractIssueIds(issue.body, repo).forEach((id) => issueIds.add(id));
	}
	return issueIds;
}
async function fetchIssue(id) {
	const repo = await getInfo();
	return await (await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/issues/${id}`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } })).json();
}

//#endregion
export { getReleaseRefs };