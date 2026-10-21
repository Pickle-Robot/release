import { Command } from "../Command.js";
import { BuilderCallback } from "yargs";

//#region src/commands/publish.d.ts
interface PublishArgv {
  profile: string;
  dryRun?: boolean;
}
type RevertAction = () => Promise<void>;
declare class Publish extends Command<PublishArgv> {
  static command: string;
  static description: string;
  static builder: BuilderCallback<{}, PublishArgv>;
  private profile;
  private context;
  /**
   * The list of clean-up functions to invoke if release fails.
   */
  private revertQueue;
  run: () => Promise<void>;
  /**
   * Execute the release script specified in the configuration.
   */
  private runReleaseScript;
  /**
   * Revert those changes that were marked as revertable.
   */
  private revertChanges;
  /**
   * Create a release commit in Git.
   */
  private createReleaseCommit;
  /**
   * Create a release tag in Git.
   */
  private createReleaseTag;
  /**
   * Generate release notes from the given commits.
   */
  private generateReleaseNotes;
  /**
   * Push the release commit and tag to the remote.
   */
  private pushToRemote;
  /**
   * Create a new GitHub release.
   */
  private createGitHubRelease;
  /**
   * Comment on referenced GitHub issues and pull requests.
   */
  private commentOnIssues;
}
//#endregion
export { Publish, RevertAction };