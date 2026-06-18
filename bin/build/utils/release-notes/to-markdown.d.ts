import { ReleaseContext } from "../create-context.js";
import { ReleaseNotes } from "./get-release-notes.js";

//#region src/utils/release-notes/to-markdown.d.ts

/**
 * Generate a Markdown string for the given release notes.
 */
declare function toMarkdown(context: ReleaseContext, notes: ReleaseNotes): string;
declare function printAuthors(authors: Set<string>): string | undefined;
//#endregion
export { printAuthors, toMarkdown };