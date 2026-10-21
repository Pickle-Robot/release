//#region src/utils/github/create-comment.d.ts
declare function createComment(issueId: string, body: string): Promise<void>;
//#endregion
export { createComment };