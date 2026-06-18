//#region src/utils/git/get-tags.d.ts
/**
 * Return the list of tags present on the current Git branch.
 */
declare function getTags(): Promise<Array<string>>;
//#endregion
export { getTags };