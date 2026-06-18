import * as semver from "semver";

//#region src/utils/get-next-version.d.ts
declare function getNextVersion(previousVersion: string, releaseType: semver.ReleaseType): string;
//#endregion
export { getNextVersion };