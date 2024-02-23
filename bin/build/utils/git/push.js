"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.push = void 0;
const execAsync_1 = require("../execAsync");
async function push() {
    await (0, execAsync_1.execAsync)(`git push`);
}
exports.push = push;
//# sourceMappingURL=push.js.map