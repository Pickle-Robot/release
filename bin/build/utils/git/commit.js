import { execAsync } from "../exec-async.js";
import { getCommit } from "./get-commit.js";
import { parseCommits } from "./parse-commits.js";

//#region src/utils/git/commit.ts
async function commit({ files, message, allowEmpty, date }) {
	if (files) await execAsync(`git add ${files.join(" ")}`);
	await execAsync(`git commit ${[
		`-m "${message}"`,
		allowEmpty ? "--allow-empty" : "",
		date ? `--date "${date.toISOString()}"` : ""
	].join(" ")}`);
	const [commitInfo] = await parseCommits([await getCommit(await execAsync("git log --pretty=format:%H -n 1").then(({ stdout }) => stdout))]);
	return commitInfo;
}

//#endregion
export { commit };