"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextReleaseType = exports.isBreakingChange = void 0;
/**
 * Returns true if the given parsed commit represents a breaking change.
 * @see https://www.conventionalcommits.org/en/v1.0.0/#summary
 */
function isBreakingChange(commit) {
    if (commit.typeAppendix === '!') {
        return true;
    }
    if (commit.footer && commit.footer.includes('BREAKING CHANGE:')) {
        return true;
    }
    return false;
}
exports.isBreakingChange = isBreakingChange;
function getNextReleaseType(commits, options) {
    const ranges = [null, null];
    for (const commit of commits) {
        if (isBreakingChange(commit)) {
            return options?.prerelease ? 'minor' : 'major';
        }
        // Respect the parsed "type" from the "conventional-commits-parser".
        switch (commit.type) {
            case 'feat': {
                ranges[0] = 'minor';
                break;
            }
            case 'fix': {
                ranges[1] = 'patch';
                break;
            }
        }
    }
    /**
     * @fixme Commit messages can also append "!" to the scope
     * to indicate that the commit is a breaking change.
     * @see https://www.conventionalcommits.org/en/v1.0.0/#summary
     *
     * Unfortunately, "conventional-commits-parser" does not support that.
     */
    return ranges[0] || ranges[1];
}
exports.getNextReleaseType = getNextReleaseType;
//# sourceMappingURL=getNextReleaseType.js.map