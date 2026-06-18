import { Command } from "../Command.js";
import { BuilderCallback } from "yargs";

//#region src/commands/show.d.ts
interface Argv {
  _: [path: string, tag?: string];
}
declare enum ReleaseStatus {
  /**
   * Release is public and available for everybody to see
   * on the GitHub releases page.
   */
  Public = "public",
  /**
   * Release is pushed to GitHub but is marked as draft.
   */
  Draft = "draft",
  /**
   * Release is local, not present on GitHub.
   */
  Unpublished = "unpublished",
}
declare class Show extends Command<Argv> {
  static command: string;
  static description: string;
  static builder: BuilderCallback<{}, Argv>;
  run: () => Promise<void>;
  /**
   * Returns tag pointer by the given tag name.
   * If no tag name was given, looks up the latest release tag
   * and returns its pointer.
   */
  private getTagPointer;
}
//#endregion
export { ReleaseStatus, Show };