import { execAsync } from "../exec-async.js";
import { until } from "until-async";

//#region src/utils/git/get-tag.ts
/**
* Get tag pointer by tag name.
*/
async function getTag(tag) {
	const [commitHashError, commitHashData] = await until(() => {
		return execAsync(`git rev-list -n 1 ${tag}`);
	});
	if (commitHashError) return;
	return {
		tag,
		hash: commitHashData.stdout.trim()
	};
}

//#endregion
export { getTag };