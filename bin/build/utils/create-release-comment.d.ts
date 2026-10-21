import { ReleaseContext } from "./create-context.js";

//#region src/utils/create-release-comment.d.ts
interface ReleaseCommentInput {
  context: ReleaseContext;
  profile: string;
  releaseUrl: string;
}
declare function createReleaseComment(input: ReleaseCommentInput): string;
//#endregion
export { ReleaseCommentInput, createReleaseComment };