import { isBreakingChange } from "../get-next-release-type.js";
import { getCommitAuthors } from "../github/get-commit-authors.js";

//#region src/utils/release-notes/get-release-notes.ts
const IGNORED_COMMIT_TYPES = ["chore"];
async function getReleaseNotes(commits) {
	return await injectReleaseContributors(await groupCommitsByReleaseType(commits));
}
async function groupCommitsByReleaseType(commits) {
	const groups = /* @__PURE__ */ new Map();
	for (const commit of commits) {
		const { type, merge } = commit;
		if (!type || merge || IGNORED_COMMIT_TYPES.includes(type)) continue;
		const noteType = isBreakingChange(commit) ? "breaking" : type;
		const prevCommits = groups.get(noteType) || /* @__PURE__ */ new Set();
		groups.set(noteType, prevCommits.add(commit));
	}
	return groups;
}
async function injectReleaseContributors(groups) {
	const notes = /* @__PURE__ */ new Map();
	for (const [releaseType, commits] of groups) {
		notes.set(releaseType, /* @__PURE__ */ new Set());
		for (const commit of commits) {
			const authors = await getCommitAuthors(commit);
			if (authors) {
				const releaseCommit = Object.assign({}, commit, { authors });
				notes.get(releaseType)?.add(releaseCommit);
			}
		}
	}
	return notes;
}

//#endregion
export { getReleaseNotes, groupCommitsByReleaseType, injectReleaseContributors };