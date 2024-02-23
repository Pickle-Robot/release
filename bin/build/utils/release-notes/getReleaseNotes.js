"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectReleaseContributors = exports.groupCommitsByReleaseType = exports.getReleaseNotes = void 0;
const getNextReleaseType_1 = require("../getNextReleaseType");
const getCommitAuthors_1 = require("../github/getCommitAuthors");
const IGNORED_COMMIT_TYPES = ['chore'];
async function getReleaseNotes(commits) {
    const groupedNotes = await groupCommitsByReleaseType(commits);
    const notes = await injectReleaseContributors(groupedNotes);
    return notes;
}
exports.getReleaseNotes = getReleaseNotes;
async function groupCommitsByReleaseType(commits) {
    const groups = new Map();
    for (const commit of commits) {
        const { type, merge } = commit;
        // Skip commits without a type, merge commits, and commit
        // types that repesent internal changes (i.e. "chore").
        if (!type || merge || IGNORED_COMMIT_TYPES.includes(type)) {
            continue;
        }
        const noteType = (0, getNextReleaseType_1.isBreakingChange)(commit)
            ? 'breaking'
            : type;
        const prevCommits = groups.get(noteType) || new Set();
        groups.set(noteType, prevCommits.add(commit));
    }
    return groups;
}
exports.groupCommitsByReleaseType = groupCommitsByReleaseType;
async function injectReleaseContributors(groups) {
    const notes = new Map();
    for (const [releaseType, commits] of groups) {
        notes.set(releaseType, new Set());
        for (const commit of commits) {
            // Don't parallelize this because then the original
            // order of commits may be lost.
            const authors = await (0, getCommitAuthors_1.getCommitAuthors)(commit);
            if (authors) {
                const releaseCommit = Object.assign({}, commit, {
                    authors,
                });
                notes.get(releaseType)?.add(releaseCommit);
            }
        }
    }
    return notes;
}
exports.injectReleaseContributors = injectReleaseContributors;
//# sourceMappingURL=getReleaseNotes.js.map