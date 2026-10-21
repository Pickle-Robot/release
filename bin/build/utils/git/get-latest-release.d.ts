import { TagPointer } from "./get-tag.js";

//#region src/utils/git/get-latest-release.d.ts
declare function byReleaseVersion(left: string, right: string): number;
declare function getLatestRelease(tags: string[]): Promise<TagPointer | undefined>;
//#endregion
export { byReleaseVersion, getLatestRelease };