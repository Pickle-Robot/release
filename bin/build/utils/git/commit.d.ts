import { ParsedCommitWithHash } from "./parse-commits.js";

//#region src/utils/git/commit.d.ts
interface CommitOptions {
  message: string;
  files?: string[];
  allowEmpty?: boolean;
  date?: Date;
}
declare function commit({
  files,
  message,
  allowEmpty,
  date
}: CommitOptions): Promise<ParsedCommitWithHash>;
//#endregion
export { CommitOptions, commit };