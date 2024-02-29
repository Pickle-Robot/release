"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publish = void 0;
const until_1 = require("@open-draft/until");
const outvariant_1 = require("outvariant");
const Command_1 = require("../Command");
const createContext_1 = require("../utils/createContext");
const getInfo_1 = require("../utils/git/getInfo");
const getNextReleaseType_1 = require("../utils/getNextReleaseType");
const getNextVersion_1 = require("../utils/getNextVersion");
const getCommits_1 = require("../utils/git/getCommits");
const getCurrentBranch_1 = require("../utils/git/getCurrentBranch");
const getLatestRelease_1 = require("../utils/git/getLatestRelease");
const bumpPackageJson_1 = require("../utils/bumpPackageJson");
const getTags_1 = require("../utils/git/getTags");
const execAsync_1 = require("../utils/execAsync");
const commit_1 = require("../utils/git/commit");
const createTag_1 = require("../utils/git/createTag");
const push_1 = require("../utils/git/push");
const getReleaseRefs_1 = require("../utils/release-notes/getReleaseRefs");
const parseCommits_1 = require("../utils/git/parseCommits");
const createComment_1 = require("../utils/github/createComment");
const createReleaseComment_1 = require("../utils/createReleaseComment");
const env_1 = require("../utils/env");
const notes_1 = require("./notes");
const fs = __importStar(require("fs"));
class Publish extends Command_1.Command {
    static command = 'publish';
    static description = 'Publish the package';
    static builder = (yargs) => {
        return yargs
            .usage('$0 publish [options]')
            .option('profile', {
            alias: 'p',
            type: 'string',
            default: 'latest',
            demandOption: true,
        })
            .option('dry-run', {
            alias: 'd',
            type: 'boolean',
            default: false,
            demandOption: false,
            description: 'Print command steps without executing them',
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
        (0, outvariant_1.invariant)(profileDefinition, 'Failed to publish: no profile found by name "%s". Did you forget to define it in "release.config.json"?', profileName);
        this.profile = profileDefinition;
        await (0, env_1.demandGitHubToken)().catch((error) => {
            this.log.error(error.message);
            process.exit(1);
        });
        await (0, env_1.demandNpmToken)().catch((error) => {
            this.log.error(error.message);
            process.exit(1);
        });
        this.revertQueue = [];
        // Extract repository information (remote/owner/name).
        const repo = await (0, getInfo_1.getInfo)().catch((error) => {
            console.error(error);
            throw new Error('Failed to get Git repository information');
        });
        const branchName = await (0, getCurrentBranch_1.getCurrentBranch)().catch((error) => {
            console.error(error);
            throw new Error('Failed to get the current branch name');
        });
        this.log.info((0, outvariant_1.format)('preparing release for "%s/%s" from branch "%s"...', repo.owner, repo.name, branchName));
        // Get the latest release.
        const tags = await (0, getTags_1.getTags)();
        const latestRelease = await (0, getLatestRelease_1.getLatestRelease)(tags);
        if (latestRelease) {
            this.log.info((0, outvariant_1.format)('found latest release: %s (%s)', latestRelease.tag, latestRelease.hash));
        }
        else {
            this.log.info('found no previous releases, creating the first one...');
        }
        const rawCommits = await (0, getCommits_1.getCommits)({
            since: latestRelease?.hash,
        });
        this.log.info((0, outvariant_1.format)('found %d new %s:\n%s', rawCommits.length, rawCommits.length > 1 ? 'commits' : 'commit', rawCommits
            .map((commit) => (0, outvariant_1.format)('  - %s %s', commit.hash, commit.subject))
            .join('\n')));
        const commits = await (0, parseCommits_1.parseCommits)(rawCommits);
        this.log.info((0, outvariant_1.format)('successfully parsed %d commit(s)!', commits.length));
        if (commits.length === 0) {
            this.log.warn('no commits since the latest release, skipping...');
            return;
        }
        // Get the next release type and version number.
        const nextReleaseType = (0, getNextReleaseType_1.getNextReleaseType)(commits, {
            prerelease: this.profile.prerelease,
        });
        if (!nextReleaseType) {
            this.log.warn('committed changes do not bump version, skipping...');
            return;
        }
        const prevVersion = latestRelease?.tag || 'v0.0.0';
        const nextVersion = (0, getNextVersion_1.getNextVersion)(prevVersion, nextReleaseType);
        this.context = (0, createContext_1.createContext)({
            repo,
            latestRelease,
            nextRelease: {
                version: nextVersion,
                publishedAt: new Date(),
            },
        });
        this.log.info((0, outvariant_1.format)('release type "%s": %s -> %s', nextReleaseType, prevVersion.replace(/^v/, ''), this.context.nextRelease.version));
        // Bump the version in package.json without committing it.
        if (this.argv.dryRun) {
            this.log.warn((0, outvariant_1.format)('skip version bump in package.json in dry-run mode (next: %s)', nextVersion));
        }
        else {
            (0, bumpPackageJson_1.bumpPackageJson)(nextVersion);
            this.log.info((0, outvariant_1.format)('bumped version in package.json to: %s', nextVersion));
        }
        // Execute the publishing script.
        await this.runReleaseScript();
        const result = await (0, until_1.until)(async () => {
            await this.createReleaseCommit();
            await this.createReleaseTag();
            await this.pushToRemote();
            const releaseNotes = await this.generateReleaseNotes(commits);
            fs.writeFileSync("release-notes.md", releaseNotes);
            const releaseUrl = await this.createGitHubRelease(releaseNotes);
            return {
                releaseUrl,
            };
        });
        // Handle any errors during the release process the same way.
        if (result.error) {
            this.log.error(result.error.message);
            /**
             * @todo Suggest a standalone command to repeat the commit/tag/release
             * part of the publishing. The actual publish script was called anyway,
             * so the package has been published at this point, just the Git info
             * updates are missing.
             */
            this.log.error('release failed, reverting changes...');
            // Revert changes in case of errors.
            await this.revertChanges();
            return process.exit(1);
        }
        // Comment on each relevant GitHub issue.
        await this.commentOnIssues(commits, result.data.releaseUrl);
        if (this.argv.dryRun) {
            this.log.warn((0, outvariant_1.format)('release "%s" completed in dry-run mode!', this.context.nextRelease.tag));
            return;
        }
        this.log.info((0, outvariant_1.format)('release "%s" completed!', this.context.nextRelease.tag));
    };
    /**
     * Execute the release script specified in the configuration.
     */
    async runReleaseScript() {
        const env = {
            RELEASE_VERSION: this.context.nextRelease.version,
        };
        this.log.info((0, outvariant_1.format)('preparing to run the publishing script with:\n%j', env));
        if (this.argv.dryRun) {
            this.log.warn('skip executing publishing script in dry-run mode');
            return;
        }
        this.log.info((0, outvariant_1.format)('executing publishing script for profile "%s": %s'), this.profile.name, this.profile.use);
        const releaseScriptPromise = (0, execAsync_1.execAsync)(this.profile.use, {
            env: {
                ...process.env,
                ...env,
            },
        });
        // Forward the publish script's stdio to the logger.
        releaseScriptPromise.io.stdout?.pipe(process.stdout);
        releaseScriptPromise.io.stderr?.pipe(process.stderr);
        await releaseScriptPromise.catch((error) => {
            this.log.error(error);
            this.log.error('Failed to publish: the publish script errored. See the original error above.');
            process.exit(releaseScriptPromise.io.exitCode || 1);
        });
        this.log.info('published successfully!');
    }
    /**
     * Revert those changes that were marked as revertable.
     */
    async revertChanges() {
        let revert;
        while ((revert = this.revertQueue.pop())) {
            await revert();
        }
    }
    /**
     * Create a release commit in Git.
     */
    async createReleaseCommit() {
        const message = `chore(release): ${this.context.nextRelease.tag}`;
        if (this.argv.dryRun) {
            this.log.warn((0, outvariant_1.format)('skip creating a release commit in dry-run mode: "%s"', message));
            return;
        }
        const commitResult = await (0, until_1.until)(() => {
            return (0, commit_1.commit)({
                files: ['package.json'],
                message,
            });
        });
        (0, outvariant_1.invariant)(commitResult.error == null, 'Failed to create release commit!\n', commitResult.error);
        this.log.info((0, outvariant_1.format)('created a release commit at "%s"!', commitResult.data.hash));
        this.revertQueue.push(async () => {
            this.log.info('reverting the release commit...');
            const hasChanges = await (0, execAsync_1.execAsync)('git diff');
            if (hasChanges) {
                this.log.info('detected uncommitted changes, stashing...');
                await (0, execAsync_1.execAsync)('git stash');
            }
            await (0, execAsync_1.execAsync)('git reset --hard HEAD~1').finally(async () => {
                if (hasChanges) {
                    this.log.info('unstashing uncommitted changes...');
                    await (0, execAsync_1.execAsync)('git stash pop');
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
            this.log.warn((0, outvariant_1.format)('skip creating a release tag in dry-run mode: %s', nextTag));
            return;
        }
        const tagResult = await (0, until_1.until)(async () => {
            const tag = await (0, createTag_1.createTag)(nextTag);
            await (0, execAsync_1.execAsync)(`git push origin ${tag}`);
            return tag;
        });
        (0, outvariant_1.invariant)(tagResult.error == null, 'Failed to tag the release!\n', tagResult.error);
        this.revertQueue.push(async () => {
            const tagToRevert = this.context.nextRelease.tag;
            this.log.info((0, outvariant_1.format)('reverting the release tag "%s"...', tagToRevert));
            await (0, execAsync_1.execAsync)(`git tag -d ${tagToRevert}`);
            await (0, execAsync_1.execAsync)(`git push --delete origin ${tagToRevert}`);
        });
        this.log.info((0, outvariant_1.format)('created release tag "%s"!', tagResult.data));
    }
    /**
     * Generate release notes from the given commits.
     */
    async generateReleaseNotes(commits) {
        this.log.info((0, outvariant_1.format)('generating release notes for %d commits...', commits.length));
        const releaseNotes = await notes_1.Notes.generateReleaseNotes(this.context, commits);
        this.log.info(`generated release notes:\n\n${releaseNotes}\n`);
        return releaseNotes;
    }
    /**
     * Push the release commit and tag to the remote.
     */
    async pushToRemote() {
        if (this.argv.dryRun) {
            this.log.warn('skip pushing release to Git in dry-run mode');
            return;
        }
        const pushResult = await (0, until_1.until)(() => (0, push_1.push)());
        (0, outvariant_1.invariant)(pushResult.error == null, 'Failed to push changes to origin!\n', pushResult.error);
        this.log.info((0, outvariant_1.format)('pushed changes to "%s" (origin)!', this.context.repo.remote));
    }
    /**
     * Create a new GitHub release.
     */
    async createGitHubRelease(releaseNotes) {
        this.log.info('creating a new GitHub release...');
        if (this.argv.dryRun) {
            this.log.warn('skip creating a GitHub release in dry-run mode');
            return '#';
        }
        const release = await notes_1.Notes.createRelease(this.context, releaseNotes);
        const { html_url: releaseUrl } = release;
        this.log.info((0, outvariant_1.format)('created release: %s', releaseUrl));
        return releaseUrl;
    }
    /**
     * Comment on referenced GitHub issues and pull requests.
     */
    async commentOnIssues(commits, releaseUrl) {
        this.log.info('commenting on referenced GitHib issues...');
        const referencedIssueIds = await (0, getReleaseRefs_1.getReleaseRefs)(commits);
        const issuesCount = referencedIssueIds.size;
        const releaseCommentText = (0, createReleaseComment_1.createReleaseComment)({
            context: this.context,
            releaseUrl,
        });
        if (issuesCount === 0) {
            this.log.info('no referenced GitHub issues, nothing to comment!');
            return;
        }
        this.log.info((0, outvariant_1.format)('found %d referenced GitHub issues!', issuesCount));
        const issuesNoun = issuesCount === 1 ? 'issue' : 'issues';
        const issuesDisplayList = Array.from(referencedIssueIds)
            .map((id) => `  - ${id}`)
            .join('\n');
        if (this.argv.dryRun) {
            this.log.warn((0, outvariant_1.format)('skip commenting on %d GitHub %s:\n%s', issuesCount, issuesNoun, issuesDisplayList));
            return;
        }
        this.log.info((0, outvariant_1.format)('commenting on %d GitHub %s:\n%s', issuesCount, issuesNoun, issuesDisplayList));
        const commentPromises = [];
        for (const issueId of referencedIssueIds) {
            commentPromises.push((0, createComment_1.createComment)(issueId, releaseCommentText).catch((error) => {
                this.log.error((0, outvariant_1.format)('commenting on issue "%s" failed: %s', error.message));
            }));
        }
        await Promise.allSettled(commentPromises);
    }
}
exports.Publish = Publish;
//# sourceMappingURL=publish.js.map