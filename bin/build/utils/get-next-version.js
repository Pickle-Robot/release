import { invariant } from "outvariant";
import * as semver from "semver";

//#region src/utils/get-next-version.ts
function getNextVersion(previousVersion, releaseType) {
	const nextVersion = semver.inc(previousVersion, releaseType);
	invariant(nextVersion, "Failed to calculate the next version from \"%s\" using release type \"%s\"", previousVersion, releaseType);
	return nextVersion;
}

//#endregion
export { getNextVersion };