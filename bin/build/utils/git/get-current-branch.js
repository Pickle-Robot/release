import { execAsync } from "../exec-async.js";

//#region src/utils/git/get-current-branch.ts
async function getCurrentBranch() {
	const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
	return stdout.trim();
}

//#endregion
export { getCurrentBranch };