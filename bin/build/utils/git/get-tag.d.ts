//#region src/utils/git/get-tag.d.ts
interface TagPointer {
  tag: string;
  hash: string;
}
/**
 * Get tag pointer by tag name.
 */
declare function getTag(tag: string): Promise<TagPointer | undefined>;
//#endregion
export { TagPointer, getTag };