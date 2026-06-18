import { readPackageJson } from "./read-package-json.js";
import { writePackageJson } from "./write-package-json.js";

//#region src/utils/bump-package-json.ts
function bumpPackageJson(version) {
	const packageJson = readPackageJson();
	packageJson.version = version;
	writePackageJson(packageJson);
}

//#endregion
export { bumpPackageJson };