import { Commit } from "git-log-parser";

//#region src/utils/git/get-commit.d.ts
declare function getCommit(hash: string): Promise<Commit | undefined>;
//#endregion
export { getCommit };