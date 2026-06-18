import { Command } from "../Command.js";
import { execAsync } from "../utils/exec-async.js";
import { getTag } from "../utils/git/get-tag.js";
import { getLatestRelease } from "../utils/git/get-latest-release.js";
import { getTags } from "../utils/git/get-tags.js";
import { getCommit } from "../utils/git/get-commit.js";
import { getInfo } from "../utils/git/get-info.js";
import { demandGitHubToken } from "../utils/env.js";
import { format, invariant } from "outvariant";

//#region src/commands/show.ts
let ReleaseStatus = /* @__PURE__ */ function(ReleaseStatus$1) {
	/**
	* Release is public and available for everybody to see
	* on the GitHub releases page.
	*/
	ReleaseStatus$1["Public"] = "public";
	/**
	* Release is pushed to GitHub but is marked as draft.
	*/
	ReleaseStatus$1["Draft"] = "draft";
	/**
	* Release is local, not present on GitHub.
	*/
	ReleaseStatus$1["Unpublished"] = "unpublished";
	return ReleaseStatus$1;
}({});
var Show = class extends Command {
	static command = "show";
	static description = "Show release info";
	static builder = (yargs) => {
		return yargs.usage("$0 show [tag]").example([["$0 show", "Show the latest release info"], ["$0 show 1.2.3", "Show specific release tag info"]]).positional("tag", {
			type: "string",
			description: "Release tag",
			demandOption: false
		});
	};
	run = async () => {
		await demandGitHubToken().catch((error) => {
			this.log.error(error.message);
			process.exit(1);
		});
		const [, tag] = this.argv._;
		const pointer = await this.getTagPointer(tag?.toString());
		this.log.info(format("found tag \"%s\"!", pointer.tag));
		const commit = await getCommit(pointer.hash);
		invariant(commit, "Failed to retrieve release info for tag \"%s\": cannot find commit associated with the tag.", tag);
		const commitOut = await execAsync(`git log -1 ${commit.commit.long}`).then(({ stdout }) => stdout);
		this.log.info(commitOut);
		const repo = await getInfo();
		const releaseResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/releases/tags/${pointer.tag}`, { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } });
		const isPublishedRelease = releaseResponse.status === 200;
		const release = await releaseResponse.json();
		const releaseStatus = isPublishedRelease ? release.draft ? ReleaseStatus.Draft : ReleaseStatus.Public : ReleaseStatus.Unpublished;
		this.log.info(format("release status: %s", releaseStatus));
		if (releaseStatus === ReleaseStatus.Public || releaseStatus === ReleaseStatus.Draft) this.log.info(format("release url: %s", release?.html_url));
		if (!isPublishedRelease) this.log.warn(format("release \"%s\" is not published to GitHub!", pointer.tag));
	};
	/**
	* Returns tag pointer by the given tag name.
	* If no tag name was given, looks up the latest release tag
	* and returns its pointer.
	*/
	async getTagPointer(tag) {
		if (tag) {
			this.log.info(format("looking up explicit \"%s\" tag...", tag));
			const pointer = await getTag(tag);
			invariant(pointer, "Failed to retrieve release tag: tag \"%s\" does not exist.", tag);
			return pointer;
		}
		this.log.info("looking up the latest release tag...");
		const tags = await getTags();
		invariant(tags.length > 0, "Failed to retrieve release tag: repository has no releases.");
		const latestPointer = await getLatestRelease(tags);
		invariant(latestPointer, "Failed to retrieve release tag: cannot retrieve releases.");
		return latestPointer;
	}
};

//#endregion
export { ReleaseStatus, Show };