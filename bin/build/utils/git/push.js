import { execAsync } from "../exec-async.js";

//#region src/utils/git/push.ts
async function push() {
	await execAsync(`git push`);
}

//#endregion
export { push };