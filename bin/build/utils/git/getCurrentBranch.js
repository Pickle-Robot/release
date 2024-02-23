"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentBranch = void 0;
const execAsync_1 = require("../execAsync");
async function getCurrentBranch() {
    const { stdout } = await (0, execAsync_1.execAsync)('git rev-parse --abbrev-ref HEAD');
    return stdout.trim();
}
exports.getCurrentBranch = getCurrentBranch;
//# sourceMappingURL=getCurrentBranch.js.map