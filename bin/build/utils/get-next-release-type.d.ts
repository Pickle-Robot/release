import { ParsedCommitWithHash } from "./git/parse-commits.js";
import * as semver from "semver";

//#region src/utils/get-next-release-type.d.ts
interface GetNextReleaseTypeOptions {
  prerelease?: boolean;
}
/**
 * Returns true if the given parsed commit represents a breaking change.
 * @see https://www.conventionalcommits.org/en/v1.0.0/#summary
 */
declare function isBreakingChange(commit: ParsedCommitWithHash): boolean;
declare function getNextReleaseType(commits: ParsedCommitWithHash[], options?: GetNextReleaseTypeOptions): semver.ReleaseType | null;
//#endregion
export { getNextReleaseType, isBreakingChange };