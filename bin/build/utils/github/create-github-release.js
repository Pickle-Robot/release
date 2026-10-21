import { log } from "../../logger.js";
import { getGitHubRelease } from "./get-github-release.js";
import { format } from "outvariant";
import { lt } from "semver";

//#region src/utils/github/create-github-release.ts
/**
* Create a new GitHub release with the given release notes.
* This is only called if there's no existing GitHub release
* for the next release tag.
* @return {string} The URL of the newly created release.
*/
async function createGitHubRelease(context, notes) {
	const { repo } = context;
	log.info(format("creating a new GitHub release at \"%s/%s\"...", repo.owner, repo.name));
	const latestGitHubRelease = await getGitHubRelease("latest").catch((error) => {
		log.error(`Failed to fetch the latest GitHub release:`, error);
	});
	const shouldMarkAsLatest = latestGitHubRelease ? lt(latestGitHubRelease.tag_name || "0.0.0", context.nextRelease.tag) : void 0;
	/**
	* @see https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28#create-a-release
	*/
	const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/releases`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			tag_name: context.nextRelease.tag,
			name: context.nextRelease.tag,
			body: notes,
			make_latest: shouldMarkAsLatest?.toString()
		})
	});
	if (response.status === 401) throw new Error("Failed to create a new GitHub release: provided GITHUB_TOKEN does not have sufficient permissions to perform this operation. Please check your token and update it if necessary.");
	if (response.status !== 201) throw new Error(format("Failed to create a new GitHub release: GitHub API responded with status code %d.", response.status, await response.text()));
	return response.json();
}

//#endregion
export { createGitHubRelease };