import { execAsync } from "../exec-async.js";
import { array } from "get-stream";
import gitLogParser from "git-log-parser";

//#region src/utils/git/get-commit.ts
async function getCommit(hash) {
	Object.assign(gitLogParser.fields, {
		hash: "H",
		message: "B"
	});
	return (await array(gitLogParser.parse({
		_: hash,
		n: 1
	}, { cwd: execAsync.contextOptions.cwd })))?.[0];
}

//#endregion
export { getCommit };