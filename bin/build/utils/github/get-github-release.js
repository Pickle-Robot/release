import { getInfo } from "../git/get-info.js";
import { invariant } from "outvariant";

//#region src/utils/github/get-github-release.ts
async function getGitHubRelease(tag) {
	const repo = await getInfo();
	const response = await fetch(tag === "latest" ? `https://api.github.com/repos/${repo.owner}/${repo.name}/releases/latest` : `https://api.github.com/repos/${repo.owner}/${repo.name}/releases/tags/${tag}`, { headers: {
		Accept: "application/json",
		Authorization: `token ${process.env.GITHUB_TOKEN}`
	} });
	if (response.status === 404) return;
	invariant(response.ok, "Failed to fetch GitHub release for tag \"%s\": server responded with %d.\n\n%s", tag, response.status);
	return response.json();
}

//#endregion
export { getGitHubRelease };