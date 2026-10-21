import { Command } from "../Command.js";
import { getTag } from "../utils/git/get-tag.js";
import { byReleaseVersion } from "../utils/git/get-latest-release.js";
import { getTags } from "../utils/git/get-tags.js";
import { getCommit } from "../utils/git/get-commit.js";
import { getInfo } from "../utils/git/get-info.js";
import { demandGitHubToken } from "../utils/env.js";
import { parseCommits } from "../utils/git/parse-commits.js";
import { getCommits } from "../utils/git/get-commits.js";
import { getGitHubRelease } from "../utils/github/get-github-release.js";
import { createGitHubRelease } from "../utils/github/create-github-release.js";
import { getReleaseNotes } from "../utils/release-notes/get-release-notes.js";
import { toMarkdown } from "../utils/release-notes/to-markdown.js";
import { format, invariant } from "outvariant";

//#region src/commands/notes.ts
var Notes = class Notes extends Command {
	static command = "notes";
	static description = "Generate GitHub release notes for the given release version.";
	static builder = (yargs) => {
		return yargs.usage("$ notes [tag]").positional("tag", {
			type: "string",
			desciption: "Release tag",
			demandOption: true
		});
	};
	run = async () => {
		await demandGitHubToken().catch((error) => {
			this.log.error(error.message);
			process.exit(1);
		});
		const repo = await getInfo();
		const [, tagInput] = this.argv._;
		const tagName = tagInput.startsWith("v") ? tagInput : `v${tagInput}`;
		const version = tagInput.replace(/^v/, "");
		const existingRelease = await getGitHubRelease(tagName);
		if (existingRelease) {
			this.log.warn(format("found existing GitHub release for \"%s\": %s", tagName, existingRelease.html_url));
			return process.exit(1);
		}
		this.log.info(format("creating GitHub release for version \"%s\" in \"%s/%s\"...", tagName, repo.owner, repo.name));
		const tagPointer = await getTag(tagName);
		invariant(tagPointer, "Failed to create GitHub release: unknown tag \"%s\". Please make sure you are providing an existing release tag.", tagName);
		this.log.info(format("found release tag \"%s\" (%s)", tagPointer.tag, tagPointer.hash));
		const releaseCommit = await getCommit(tagPointer.hash);
		invariant(releaseCommit, "Failed to create GitHub release: unable to retrieve the commit by tag \"%s\" (%s).", tagPointer.tag, tagPointer.hash);
		const tags = await getTags().then((tags$1) => {
			return tags$1.sort(byReleaseVersion);
		});
		const previousReleaseTag = tags[tags.indexOf(tagPointer.tag) + 1];
		const previousRelease = previousReleaseTag ? await getTag(previousReleaseTag) : void 0;
		if (previousRelease?.hash) this.log.info(format("found preceding release \"%s\" (%s)", previousRelease.tag, previousRelease.hash));
		else this.log.info(format("found no released preceding \"%s\": analyzing all commits until \"%s\"...", tagPointer.tag, tagPointer.hash));
		const commits = await getCommits({
			since: previousRelease?.hash,
			until: tagPointer.hash
		}).then(parseCommits);
		const context = {
			repo,
			nextRelease: {
				version,
				tag: tagPointer.tag,
				publishedAt: releaseCommit.author.date
			},
			latestRelease: previousRelease
		};
		const releaseNotes = await Notes.generateReleaseNotes(context, commits);
		this.log.info(format("generated release notes:\n%s", releaseNotes));
		const release = await Notes.createRelease(context, releaseNotes);
		this.log.info(format("created GitHub release: %s", release.html_url));
	};
	static async generateReleaseNotes(context, commits) {
		return toMarkdown(context, await getReleaseNotes(commits));
	}
	static async createRelease(context, notes) {
		return createGitHubRelease(context, notes);
	}
};

//#endregion
export { Notes };