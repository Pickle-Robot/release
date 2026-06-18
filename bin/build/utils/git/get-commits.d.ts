import * as gitLogParser$1 from "git-log-parser";

//#region src/utils/git/get-commits.d.ts
interface GetCommitsOptions {
  since?: string;
  until?: string;
}
/**
 * Return the list of parsed commits within the given range.
 */
declare function getCommits({
  since,
  until
}?: GetCommitsOptions): Promise<gitLogParser$1.Commit[]>;
//#endregion
export { getCommits };