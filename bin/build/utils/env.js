import { validateAccessToken } from "./github/validate-access-token.js";
import { invariant } from "outvariant";

//#region src/utils/env.ts
async function demandGitHubToken() {
	const { GITHUB_TOKEN } = process.env;
	invariant(GITHUB_TOKEN, "Failed to publish the package: the \"GITHUB_TOKEN\" environment variable is not provided.");
	await validateAccessToken(GITHUB_TOKEN);
}

//#endregion
export { demandGitHubToken };