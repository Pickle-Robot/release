"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTag = void 0;
const until_1 = require("@open-draft/until");
const execAsync_1 = require("../execAsync");
/**
 * Get tag pointer by tag name.
 */
async function getTag(tag) {
    const commitHashOut = await (0, until_1.until)(() => {
        return (0, execAsync_1.execAsync)(`git rev-list -n 1 ${tag}`);
    });
    // Gracefully handle the errors.
    // Getting commit hash by tag name can fail given an unknown tag.
    if (commitHashOut.error) {
        return undefined;
    }
    return {
        tag,
        hash: commitHashOut.data.stdout.trim(),
    };
}
exports.getTag = getTag;
//# sourceMappingURL=getTag.js.map