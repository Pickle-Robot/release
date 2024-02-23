"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
function createContext(input) {
    const context = {
        repo: input.repo,
        latestRelease: input.latestRelease || undefined,
        nextRelease: {
            ...input.nextRelease,
            tag: null,
        },
    };
    Object.defineProperty(context.nextRelease, 'tag', {
        get() {
            return `v${context.nextRelease.version}`;
        },
    });
    return context;
}
exports.createContext = createContext;
//# sourceMappingURL=createContext.js.map