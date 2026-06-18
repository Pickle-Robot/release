import { log } from "../logger.js";
import { execAsync } from "./exec-async.js";
import { invariant } from "outvariant";
import { publint } from "publint";
import { formatMessage } from "publint/utils";

//#region src/utils/lint-package.ts
async function lintPackage() {
	const pkgDir = execAsync.contextOptions.cwd?.toString() || process.cwd();
	const { messages, pkg } = await publint({ pkgDir });
	let isValid = true;
	for (const message of messages) {
		log[message.type === "error" ? "error" : "warn"](formatMessage(message, pkg));
		if (message.type === "error" || message.type === "warning") isValid = false;
	}
	invariant(isValid, "Failed to lint the package at \"%s\": the package contains issues that can potentially produce a broken release. Please resolve the issues above and retry the release.", pkgDir);
}

//#endregion
export { lintPackage };