import { execAsync } from "../exec-async.js";

//#region src/utils/git/push.ts
/**
* Push the given branch and tag to "origin" in a single atomic push,
* so the remote either receives both or neither.
*/
async function push(branch, tag) {
	await execAsync(`git push --atomic origin ${branch} refs/tags/${tag}`);
}

//#endregion
export { push };