"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOriginUrl = exports.getInfo = void 0;
const outvariant_1 = require("outvariant");
const execAsync_1 = require("../execAsync");
async function getInfo() {
    const remote = await (0, execAsync_1.execAsync)(`git config --get remote.origin.url`).then(({ stdout }) => stdout.trim());
    const [owner, name] = parseOriginUrl(remote);
    (0, outvariant_1.invariant)(remote, 'Failed to extract Git info: expected an origin URL but got %s.', remote);
    (0, outvariant_1.invariant)(owner, 'Failed to extract Git info: expected repository owner but got %s.', owner);
    (0, outvariant_1.invariant)(name, 'Failed to extract Git info: expected repository name but got %s.', name);
    return {
        remote,
        owner,
        name,
        url: new URL(`https://github.com/${owner}/${name}/`).href,
    };
}
exports.getInfo = getInfo;
function parseOriginUrl(origin) {
    if (origin.startsWith('git@')) {
        const match = /:(.+?)\/(.+)\.git$/g.exec(origin);
        (0, outvariant_1.invariant)(match, 'Failed to parse origin URL "%s": invalid URL structure.', origin);
        return [match[1], match[2]];
    }
    if (/^http(s)?:\/\//.test(origin)) {
        const url = new URL(origin);
        const match = /\/(.+?)\/(.+?)(\.git)?$/.exec(url.pathname);
        (0, outvariant_1.invariant)(match, 'Failed to parse origin URL "%s": invalid URL structure.', origin);
        return [match[1], match[2]];
    }
    (0, outvariant_1.invariant)(false, 'Failed to extract repository owner/name: given origin URL "%s" is of unknown scheme (Git/HTTP/HTTPS).', origin);
}
exports.parseOriginUrl = parseOriginUrl;
//# sourceMappingURL=getInfo.js.map