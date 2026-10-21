import { ParsedCommitWithHash } from "./parse-commits.js";

//#region src/utils/git/get-pull-request-number.d.ts

/**
 * Return the number of the pull request the given commit was squash-merged
 * from, read from its subject. Commits that reached the branch any other way,
 * such as through a merge commit, have none.
 */
declare function getPullRequestNumber(commit: ParsedCommitWithHash): string | undefined;
//#endregion
export { getPullRequestNumber };