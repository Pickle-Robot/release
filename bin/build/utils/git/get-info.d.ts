//#region src/utils/git/get-info.d.ts
interface GitInfo {
  owner: string;
  name: string;
  remote: string;
  url: string;
}
declare function getInfo(): Promise<GitInfo>;
declare function parseOriginUrl(origin: string): [string, string];
//#endregion
export { GitInfo, getInfo, parseOriginUrl };