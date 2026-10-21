import type { ParsedCommitWithHash } from '#/src/utils/git/parse-commits.js'

// GitHub ends a squash-merge commit subject with the pull request number,
// e.g. "fix: handle errors (#12)".
const SQUASH_MERGE_PULL_REQUEST_REGEXP = /\(#(\d+)\)\s*$/

/**
 * Return the number of the pull request the given commit was squash-merged
 * from, read from its subject. Commits that reached the branch any other way,
 * such as through a merge commit, have none.
 */
export function getPullRequestNumber(
  commit: ParsedCommitWithHash,
): string | undefined {
  return commit.header?.match(SQUASH_MERGE_PULL_REQUEST_REGEXP)?.[1]
}
