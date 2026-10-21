import { Commit } from "git-log-parser";
import { Commit as Commit$1 } from "conventional-commits-parser";

//#region src/utils/git/parse-commits.d.ts
type ParsedCommitWithHash = Commit$1 & {
  hash: string;
  typeAppendix?: '!' | (string & {});
};
declare function parseCommits(commits: Commit[]): Promise<Array<ParsedCommitWithHash>>;
//#endregion
export { ParsedCommitWithHash, parseCommits };