import { formatDate } from "../format-date.js";

//#region src/utils/release-notes/to-markdown.ts
/**
* Generate a Markdown string for the given release notes.
*/
function toMarkdown(context, notes) {
	const markdown = [];
	const releaseDate = formatDate(context.nextRelease.publishedAt);
	markdown.push(`## ${context.nextRelease.tag} (${releaseDate})`);
	const sections = {
		breaking: [],
		feat: [],
		fix: []
	};
	for (const [noteType, commits] of notes) {
		const section = sections[noteType];
		if (!section) continue;
		for (const commit of commits) {
			const releaseItem = createReleaseItem(commit, noteType === "breaking");
			if (releaseItem) section.push(...releaseItem);
		}
	}
	if (sections.breaking.length > 0) {
		markdown.push("", "### ⚠️ BREAKING CHANGES");
		markdown.push(...sections.breaking);
	}
	if (sections.feat.length > 0) {
		markdown.push("", "### Features", "");
		markdown.push(...sections.feat);
	}
	if (sections.fix.length > 0) {
		markdown.push("", "### Bug Fixes", "");
		markdown.push(...sections.fix);
	}
	return markdown.join("\n");
}
function createReleaseItem(commit, includeCommitNotes = false) {
	const { subject, scope, hash } = commit;
	if (!subject) return [];
	const commitLine = [[
		"-",
		scope && `**${scope}:**`,
		subject,
		`(${hash})`,
		printAuthors(commit.authors)
	].filter(Boolean).join(" ")];
	if (includeCommitNotes) {
		const notes = commit.notes.reduce((all, note) => {
			return all.concat("", note.text);
		}, []);
		if (notes.length > 0) {
			commitLine.unshift("");
			commitLine.push(...notes);
		}
	}
	return commitLine;
}
function printAuthors(authors) {
	if (authors.size === 0) return;
	return Array.from(authors).map((login) => `@${login}`).join(" ");
}

//#endregion
export { printAuthors, toMarkdown };