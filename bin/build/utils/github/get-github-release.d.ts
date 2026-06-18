//#region src/utils/github/get-github-release.d.ts
interface GitHubRelease {
  tag_name: string;
  html_url: string;
}
declare function getGitHubRelease(tag: string | ('latest' & {})): Promise<GitHubRelease | undefined>;
//#endregion
export { GitHubRelease, getGitHubRelease };