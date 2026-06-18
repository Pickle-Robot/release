import { getInfo } from "../git/get-info.js";
import { invariant } from "outvariant";

//#region src/utils/github/create-comment.ts
async function createComment(issueId, body) {
	const repo = await getInfo();
	invariant((await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/issues/${issueId}/comments`, {
		method: "POST",
		headers: {
			Authorization: `token ${process.env.GITHUB_TOKEN}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ body })
	})).ok, "Failed to create GitHub comment for \"%s\" issue.", issueId);
}

//#endregion
export { createComment };