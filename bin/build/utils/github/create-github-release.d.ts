import { ReleaseContext } from "../create-context.js";
import { GitHubRelease } from "./get-github-release.js";

//#region src/utils/github/create-github-release.d.ts

/**
 * Create a new GitHub release with the given release notes.
 * This is only called if there's no existing GitHub release
 * for the next release tag.
 * @return {string} The URL of the newly created release.
 */
declare function createGitHubRelease(context: ReleaseContext, notes: string): Promise<GitHubRelease>;
//#endregion
export { createGitHubRelease };