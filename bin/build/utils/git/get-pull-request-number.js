//#region src/utils/git/get-pull-request-number.ts
const SQUASH_MERGE_PULL_REQUEST_REGEXP = /\(#(\d+)\)\s*$/;
/**
* Return the number of the pull request the given commit was squash-merged
* from, read from its subject. Commits that reached the branch any other way,
* such as through a merge commit, have none.
*/
function getPullRequestNumber(commit) {
	return commit.header?.match(SQUASH_MERGE_PULL_REQUEST_REGEXP)?.[1];
}

//#endregion
export { getPullRequestNumber };