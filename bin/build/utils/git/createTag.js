"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTag = void 0;
const execAsync_1 = require("../execAsync");
async function createTag(tag) {
    await (0, execAsync_1.execAsync)(`git tag ${tag}`);
    const latestTag = await (0, execAsync_1.execAsync)(`git describe --tags --abbrev=0`).then(({ stdout }) => stdout);
    return latestTag.trim();
}
exports.createTag = createTag;
//# sourceMappingURL=createTag.js.map