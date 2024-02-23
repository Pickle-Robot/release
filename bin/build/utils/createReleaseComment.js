"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReleaseComment = void 0;
const readPackageJson_1 = require("./readPackageJson");
function createReleaseComment(input) {
    const { context, releaseUrl } = input;
    const packageJson = (0, readPackageJson_1.readPackageJson)();
    return `## Released: ${context.nextRelease.tag} 🎉

This has been released in ${context.nextRelease.tag}!

- 📄 [**Release notes**](${releaseUrl})
- 📦 [npm package](https://www.npmjs.com/package/${packageJson.name}/v/${context.nextRelease.version})

Make sure to always update to the latest version (\`npm i ${packageJson.name}@latest\`) to get the newest features and bug fixes.

---

_Predictable release automation by [@ossjs/release](https://github.com/ossjs/release)_.`;
}
exports.createReleaseComment = createReleaseComment;
//# sourceMappingURL=createReleaseComment.js.map