import { execAsync } from "./exec-async.js";
import * as fs from "node:fs";
import * as path from "node:path";

//#region src/utils/read-package-json.ts
function readPackageJson() {
	const packageJsonPath = path.resolve(execAsync.contextOptions.cwd?.toString() || process.cwd(), "package.json");
	return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

//#endregion
export { readPackageJson };