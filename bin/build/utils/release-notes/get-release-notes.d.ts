import { ParsedCommitWithHash } from "../git/parse-commits.js";

//#region src/utils/release-notes/get-release-notes.d.ts
type ReleaseNoteType = 'breaking' | 'feat' | 'fix';
type GroupedCommits = Map<ReleaseNoteType, Set<ParsedCommitWithHash>>;
type ReleaseNoteCommit = ParsedCommitWithHash & {
  [key: string]: any;
  authors: Set<string>;
};
type ReleaseNotes = Map<ReleaseNoteType, Set<ReleaseNoteCommit>>;
declare function getReleaseNotes(commits: ParsedCommitWithHash[]): Promise<ReleaseNotes>;
declare function groupCommitsByReleaseType(commits: ParsedCommitWithHash[]): Promise<GroupedCommits>;
declare function injectReleaseContributors(groups: GroupedCommits): Promise<ReleaseNotes>;
//#endregion
export { GroupedCommits, ReleaseNoteCommit, ReleaseNoteType, ReleaseNotes, getReleaseNotes, groupCommitsByReleaseType, injectReleaseContributors };