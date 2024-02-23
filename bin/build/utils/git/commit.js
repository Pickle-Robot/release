"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commit = void 0;
const execAsync_1 = require("../execAsync");
const getCommit_1 = require("./getCommit");
const parseCommits_1 = require("./parseCommits");
async function commit({ files, message, allowEmpty, date, }) {
    if (files) {
        await (0, execAsync_1.execAsync)(`git add ${files.join(' ')}`);
    }
    const args = [
        `-m "${message}"`,
        allowEmpty ? '--allow-empty' : '',
        date ? `--date "${date.toISOString()}"` : '',
    ];
    await (0, execAsync_1.execAsync)(`git commit ${args.join(' ')}`);
    const hash = await (0, execAsync_1.execAsync)('git log --pretty=format:%H -n 1').then(({ stdout }) => stdout);
    const commit = (await (0, getCommit_1.getCommit)(hash));
    const [commitInfo] = await (0, parseCommits_1.parseCommits)([commit]);
    return commitInfo;
}
exports.commit = commit;
//# sourceMappingURL=commit.js.map