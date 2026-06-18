import { ParsedCommitWithHash } from "../git/parse-commits.js";

//#region src/utils/release-notes/get-release-refs.d.ts
declare function getReleaseRefs(commits: ParsedCommitWithHash[]): Promise<Set<string>>;
interface IssueOrPullRequest {
  html_url: string;
  pull_request: Record<string, string> | null;
  body: string | null;
}
//#endregion
export { IssueOrPullRequest, getReleaseRefs };