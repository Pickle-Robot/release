import { readPackageJson } from "./read-package-json.js";

//#region src/utils/create-release-comment.ts
function createReleaseComment(input) {
	const { context, profile, releaseUrl } = input;
	const packageJson = readPackageJson();
	return `## Released: ${context.nextRelease.tag} 🎉

This has been released in ${context.nextRelease.tag}.

- 📄 [**Release notes**](${releaseUrl})
- 📦 [View on npm](https://www.npmjs.com/package/${packageJson.name}/v/${context.nextRelease.version})

Get these changes by running the following command:

\`\`\`
npm i ${packageJson.name}@${input.profile}
\`\`\`

---

_Predictable release automation by [Release](https://github.com/ossjs/release)_.`;
}

//#endregion
export { createReleaseComment };