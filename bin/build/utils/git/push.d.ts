//#region src/utils/git/push.d.ts
/**
 * Push the given branch and tag to "origin" in a single atomic push,
 * so the remote either receives both or neither.
 */
declare function push(branch: string, tag: string): Promise<void>;
//#endregion
export { push };