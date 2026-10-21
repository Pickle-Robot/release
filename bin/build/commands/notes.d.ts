import { Command } from "../Command.js";
import { ReleaseContext } from "../utils/create-context.js";
import { ParsedCommitWithHash } from "../utils/git/parse-commits.js";
import { GitHubRelease } from "../utils/github/get-github-release.js";
import { BuilderCallback } from "yargs";

//#region src/commands/notes.d.ts
interface Argv {
  _: [path: string, tag: string];
}
declare class Notes extends Command<Argv> {
  static command: string;
  static description: string;
  static builder: BuilderCallback<{}, Argv>;
  run: () => Promise<undefined>;
  static generateReleaseNotes(context: ReleaseContext, commits: ParsedCommitWithHash[]): Promise<string>;
  static createRelease(context: ReleaseContext, notes: string): Promise<GitHubRelease>;
}
//#endregion
export { Notes };