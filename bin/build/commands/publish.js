import { Command } from "../Command.js";
import "../utils/get-config.js";
import { execAsync } from "../utils/exec-async.js";
import { getLatestRelease } from "../utils/git/get-latest-release.js";
import { getTags } from "../utils/git/get-tags.js";
import { getInfo } from "../utils/git/get-info.js";
import { demandGitHubToken } from "../utils/env.js";
import { createContext } from "../utils/create-context.js";
import { parseCommits } from "../utils/git/parse-commits.js";
import { getNextReleaseType } from "../utils/get-next-release-type.js";
import { getNextVersion } from "../utils/get-next-version.js";
import { getCommits } from "../utils/git/get-commits.js";
import { getCurrentBranch } from "../utils/git/get-current-branch.js";
import { bumpPackageJson } from "../utils/bump-package-json.js";
import { commit } from "../utils/git/commit.js";
import { createTag } from "../utils/git/create-tag.js";
import { push } from "../utils/git/push.js";
import { getReleaseRefs } from "../utils/release-notes/get-release-refs.js";
import { createComment } from "../utils/github/create-comment.js";
import { createReleaseComment } from "../utils/create-release-comment.js";
import { Notes } from "./notes.js";
import { lintPackage } from "../utils/lint-package.js";
import "yargs";
import { format, invariant } from "outvariant";
import { until } from "until-async";
import * as fs from "fs";

//#region src/commands/publish.ts
var Publish = class extends Command {
	static command = "publish";
	static description = "Publish the package";
	static builder = (yargs$1) => {
		return yargs$1.usage("$0 publish [options]").option("profile", {
			alias: "p",
			type: "string",
			default: "latest",
			demandOption: true
		}).option("dry-run", {
			alias: "d",
			type: "boolean",
			default: false,
			demandOption: false,
			description: "Print command steps without executing them"
		});
	};
	profile = null;
	context = null;
	/**
	* The list of clean-up functions to invoke if release fails.
	*/
	revertQueue = [];
	run = async () => {
		const profileName = this.argv.profile;
		const profileDefinition = this.config.profiles.find((definedProfile) => {
			return definedProfile.name === profileName;
		});
		invariant(profileDefinition, "Failed to publish: no profile found by name \"%s\". Did you forget to define it in \"release.config.json\"?", profileName);
		this.profile = profileDefinition;
		await demandGitHubToken().catch((error) => {
			this.log.error(error.message);
			process.exit(1);
		});
		this.revertQueue = [];
		const repo = await getInfo().catch((error) => {
			this.log.error(error);
			throw new Error("Failed to get Git repository information");
		});
		const branchName = await getCurrentBranch().catch((error) => {
			this.log.error(error);
			throw new Error("Failed to get the current branch name");
		});
		this.log.info(format("preparing release for \"%s/%s\" from branch \"%s\"...", repo.owner, repo.name, branchName));
		const latestRelease = await getLatestRelease(await getTags());
		if (latestRelease) this.log.info(format("found latest release: %s (%s)", latestRelease.tag, latestRelease.hash));
		else this.log.info("found no previous releases, creating the first one...");
		const rawCommits = await getCommits({ since: latestRelease?.hash });
		this.log.info(format("found %d new %s:\n%s", rawCommits.length, rawCommits.length > 1 ? "commits" : "commit", rawCommits.map((commit$1) => format("  - %s %s", commit$1.hash, commit$1.subject)).join("\n")));
		const commits = await parseCommits(rawCommits);
		this.log.info(format("successfully parsed %d commit(s)!", commits.length));
		if (commits.length === 0) {
			this.log.warn("no commits since the latest release, skipping...");
			return;
		}
		const nextReleaseType = getNextReleaseType(commits, { prerelease: this.profile.prerelease });
		if (!nextReleaseType) {
			this.log.warn("committed changes do not bump version, skipping...");
			return;
		}
		const prevVersion = latestRelease?.tag || "v0.0.0";
		const nextVersion = getNextVersion(prevVersion, nextReleaseType);
		this.context = createContext({
			repo,
			latestRelease,
			nextRelease: {
				version: nextVersion,
				publishedAt: /* @__PURE__ */ new Date()
			}
		});
		this.log.info(format("release type \"%s\": %s -> %s", nextReleaseType, prevVersion.replace(/^v/, ""), this.context.nextRelease.version));
		this.log.info("linting the packed package...");
		const [lintError] = await until(() => {
			return lintPackage();
		});
		if (lintError) {
			this.log.error(lintError.message);
			return process.exit(1);
		}
		this.log.info("package is healthy and ready for publishing!");
		if (this.argv.dryRun) this.log.warn(format("skip version bump in package.json in dry-run mode (next: %s)", nextVersion));
		else {
			bumpPackageJson(nextVersion);
			this.log.info(format("bumped version in package.json to: %s", nextVersion));
		}
		await this.runReleaseScript();
		const [resultError, resultData] = await until(async () => {
			await this.createReleaseCommit();
			await this.createReleaseTag();
			await this.pushToRemote();
			const releaseNotes = await this.generateReleaseNotes(commits);
			fs.writeFileSync("release-notes.md", releaseNotes);
			return { releaseUrl: await this.createGitHubRelease(releaseNotes) };
		});
		if (resultError) {
			this.log.error(resultError.message);
			/**
			* @todo Suggest a standalone command to repeat the commit/tag/release
			* part of the publishing. The actual publish script was called anyway,
			* so the package has been published at this point, just the Git info
			* updates are missing.
			*/
			this.log.error("release failed, reverting changes...");
			await this.revertChanges();
			return process.exit(1);
		}
		await this.commentOnIssues(commits, resultData.releaseUrl);
		if (this.argv.dryRun) {
			this.log.warn(format("release \"%s\" completed in dry-run mode!", this.context.nextRelease.tag));
			return;
		}
		this.log.info(format("release \"%s\" completed!", this.context.nextRelease.tag));
	};
	/**
	* Execute the release script specified in the configuration.
	*/
	async runReleaseScript() {
		const env = { RELEASE_VERSION: this.context.nextRelease.version };
		this.log.info(format("preparing to run the publishing script with:\n%j", env));
		if (this.argv.dryRun) {
			this.log.warn("skip executing publishing script in dry-run mode");
			return;
		}
		this.log.info(format("executing publishing script for profile \"%s\": %s"), this.profile.name, this.profile.use);
		const releaseScriptPromise = execAsync(this.profile.use, { env: {
			...process.env,
			...env
		} });
		releaseScriptPromise.io.stdout?.pipe(process.stdout);
		releaseScriptPromise.io.stderr?.pipe(process.stderr);
		await releaseScriptPromise.catch((error) => {
			this.log.error(error);
			this.log.error("Failed to publish: the publish script errored. See the original error above.");
			process.exit(releaseScriptPromise.io.exitCode || 1);
		});
		this.log.info("published successfully!");
	}
	/**
	* Revert those changes that were marked as revertable.
	*/
	async revertChanges() {
		let revert;
		while (revert = this.revertQueue.pop()) await revert?.();
	}
	/**
	* Create a release commit in Git.
	*/
	async createReleaseCommit() {
		const message = `chore(release): ${this.context.nextRelease.tag}`;
		if (this.argv.dryRun) {
			this.log.warn(format("skip creating a release commit in dry-run mode: \"%s\"", message));
			return;
		}
		const [commitError, commitData] = await until(() => {
			return commit({
				files: ["package.json"],
				message
			});
		});
		invariant(commitError == null, "Failed to create release commit!\n", commitError);
		this.log.info(format("created a release commit at \"%s\"!", commitData.hash));
		this.revertQueue.push(async () => {
			this.log.info("reverting the release commit...");
			const hasChanges = await execAsync("git diff");
			if (hasChanges) {
				this.log.info("detected uncommitted changes, stashing...");
				await execAsync("git stash");
			}
			await execAsync("git reset --hard HEAD~1").finally(async () => {
				if (hasChanges) {
					this.log.info("unstashing uncommitted changes...");
					await execAsync("git stash pop");
				}
			});
		});
	}
	/**
	* Create a release tag in Git.
	*/
	async createReleaseTag() {
		const nextTag = this.context.nextRelease.tag;
		if (this.argv.dryRun) {
			this.log.warn(format("skip creating a release tag in dry-run mode: %s", nextTag));
			return;
		}
		const [tagError, tagData] = await until(async () => {
			const tag = await createTag(nextTag);
			await execAsync(`git push origin ${tag}`);
			return tag;
		});
		invariant(tagError == null, "Failed to tag the release!\n", tagError);
		this.revertQueue.push(async () => {
			const tagToRevert = this.context.nextRelease.tag;
			this.log.info(format("reverting the release tag \"%s\"...", tagToRevert));
			await execAsync(`git tag -d ${tagToRevert}`);
			await execAsync(`git push --delete origin ${tagToRevert}`);
		});
		this.log.info(format("created release tag \"%s\"!", tagData));
	}
	/**
	* Generate release notes from the given commits.
	*/
	async generateReleaseNotes(commits) {
		this.log.info(format("generating release notes for %d commits...", commits.length));
		const releaseNotes = await Notes.generateReleaseNotes(this.context, commits);
		this.log.info(`generated release notes:\n\n${releaseNotes}\n`);
		return releaseNotes;
	}
	/**
	* Push the release commit and tag to the remote.
	*/
	async pushToRemote() {
		if (this.argv.dryRun) {
			this.log.warn("skip pushing release to Git in dry-run mode");
			return;
		}
		const [pushError] = await until(() => push());
		invariant(pushError == null, "Failed to push changes to origin!\n", pushError);
		this.log.info(format("pushed changes to \"%s\" (origin)!", this.context.repo.remote));
	}
	/**
	* Create a new GitHub release.
	*/
	async createGitHubRelease(releaseNotes) {
		this.log.info("creating a new GitHub release...");
		if (this.argv.dryRun) {
			this.log.warn("skip creating a GitHub release in dry-run mode");
			return "#";
		}
		const { html_url: releaseUrl } = await Notes.createRelease(this.context, releaseNotes);
		this.log.info(format("created release: %s", releaseUrl));
		return releaseUrl;
	}
	/**
	* Comment on referenced GitHub issues and pull requests.
	*/
	async commentOnIssues(commits, releaseUrl) {
		this.log.info("commenting on referenced GitHib issues...");
		const referencedIssueIds = await getReleaseRefs(commits);
		const issuesCount = referencedIssueIds.size;
		const releaseCommentText = createReleaseComment({
			profile: this.profile.name,
			context: this.context,
			releaseUrl
		});
		if (issuesCount === 0) {
			this.log.info("no referenced GitHub issues, nothing to comment!");
			return;
		}
		this.log.info(format("found %d referenced GitHub issues!", issuesCount));
		const issuesNoun = issuesCount === 1 ? "issue" : "issues";
		const issuesDisplayList = Array.from(referencedIssueIds).map((id) => `  - ${id}`).join("\n");
		if (this.argv.dryRun) {
			this.log.warn(format("skip commenting on %d GitHub %s:\n%s", issuesCount, issuesNoun, issuesDisplayList));
			return;
		}
		this.log.info(format("commenting on %d GitHub %s:\n%s", issuesCount, issuesNoun, issuesDisplayList));
		const commentPromises = [];
		for (const issueId of referencedIssueIds) commentPromises.push(createComment(issueId, releaseCommentText).catch((error) => {
			this.log.error(format("commenting on issue \"%s\" failed: %s", error.message));
		}));
		await Promise.allSettled(commentPromises);
	}
};

//#endregion
export { Publish };