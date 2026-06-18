import { execAsync } from "../exec-async.js";
import { array } from "get-stream";
import * as gitLogParser$1 from "git-log-parser";

//#region src/utils/git/get-commits.ts
/**
* Return the list of parsed commits within the given range.
*/
function getCommits({ since, until = "HEAD" } = {}) {
	Object.assign(gitLogParser$1.fields, {
		hash: "H",
		message: "B"
	});
	const range = since ? `${since}..${until}` : until;
	const skip = range === until && until !== "HEAD" ? 1 : void 0;
	return array(gitLogParser$1.parse({
		_: range,
		skip
	}, { cwd: execAsync.contextOptions.cwd }));
}

//#endregion
export { getCommits };