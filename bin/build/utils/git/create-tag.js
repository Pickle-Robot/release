import { execAsync } from "../exec-async.js";

//#region src/utils/git/create-tag.ts
async function createTag(tag) {
	await execAsync(`git tag ${tag}`);
	return (await execAsync(`git describe --tags --abbrev=0`).then(({ stdout }) => stdout)).trim();
}

//#endregion
export { createTag };