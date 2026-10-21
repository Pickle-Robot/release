import { getTag } from "./get-tag.js";
import * as semver from "semver";

//#region src/utils/git/get-latest-release.ts
function byReleaseVersion(left, right) {
	return semver.rcompare(left, right);
}
async function getLatestRelease(tags) {
	const [latestTag] = tags.filter((tag) => {
		return semver.valid(tag);
	}).sort(byReleaseVersion);
	if (!latestTag) return;
	return getTag(latestTag);
}

//#endregion
export { byReleaseVersion, getLatestRelease };