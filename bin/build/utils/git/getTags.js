"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTags = void 0;
const execAsync_1 = require("../execAsync");
/**
 * Return the list of tags present on the current Git branch.
 */
async function getTags() {
    const allTags = await (0, execAsync_1.execAsync)('git tag --merged').then(({ stdout }) => stdout);
    return allTags.split('\n').filter(Boolean);
}
exports.getTags = getTags;
//# sourceMappingURL=getTags.js.map