import { execAsync } from "./exec-async.js";
import * as fs from "node:fs";
import * as path from "node:path";

//#region src/utils/write-package-json.ts
function writePackageJson(nextContent) {
	const packageJsonPath = path.resolve(execAsync.contextOptions.cwd.toString(), "package.json");
	fs.writeFileSync(
		packageJsonPath,
		/**
		* @fixme Do not alter the indentation.
		*/
		JSON.stringify(nextContent, null, 2)
	);
}

//#endregion
export { writePackageJson };