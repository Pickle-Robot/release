import { execAsync } from "../exec-async.js";

//#region src/utils/git/get-tags.ts
/**
* Return the list of tags present on the current Git branch.
*/
async function getTags() {
	return (await execAsync("git tag --merged").then(({ stdout }) => stdout)).split("\n").filter(Boolean);
}

//#endregion
export { getTags };