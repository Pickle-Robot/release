import { GitInfo } from "./git/get-info.js";
import { TagPointer } from "./git/get-tag.js";

//#region src/utils/create-context.d.ts
interface ReleaseContext {
  repo: GitInfo;
  latestRelease?: TagPointer;
  nextRelease: {
    version: string;
    readonly tag: string;
    publishedAt: Date;
  };
}
interface ReleaseContextInput {
  repo: GitInfo;
  latestRelease?: TagPointer;
  nextRelease: {
    version: string;
    publishedAt: Date;
  };
}
declare function createContext(input: ReleaseContextInput): ReleaseContext;
//#endregion
export { ReleaseContext, ReleaseContextInput, createContext };