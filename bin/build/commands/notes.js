"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notes = void 0;
const outvariant_1 = require("outvariant");
const env_1 = require("../utils/env");
const createGitHubRelease_1 = require("../utils/github/createGitHubRelease");
const Command_1 = require("../Command");
const getInfo_1 = require("../utils/git/getInfo");
const parseCommits_1 = require("../utils/git/parseCommits");
const getReleaseNotes_1 = require("../utils/release-notes/getReleaseNotes");
const toMarkdown_1 = require("../utils/release-notes/toMarkdown");
const getCommits_1 = require("../utils/git/getCommits");
const getTag_1 = require("../utils/git/getTag");
const getCommit_1 = require("../utils/git/getCommit");
const getLatestRelease_1 = require("../utils/git/getLatestRelease");
const getTags_1 = require("../utils/git/getTags");
const getGitHubRelease_1 = require("../utils/github/getGitHubRelease");
class Notes extends Command_1.Command {
    static command = 'notes';
    static description = 'Generate GitHub release notes for the given release version.';
    static builder = (yargs) => {
        return yargs.usage('$ notes [tag]').positional('tag', {
            type: 'string',
            desciption: 'Release tag',
            demandOption: true,
        });
    };
    run = async () => {
        await (0, env_1.demandGitHubToken)().catch((error) => {
            this.log.error(error.message);
            process.exit(1);
        });
        const repo = await (0, getInfo_1.getInfo)();
        const [, tagInput] = this.argv._;
        const tagName = tagInput.startsWith('v') ? tagInput : `v${tagInput}`;
        const version = tagInput.replace(/^v/, '');
        // Check if there's an existing GitHub release for the given tag.
        const existingRelease = await (0, getGitHubRelease_1.getGitHubRelease)(tagName);
        if (existingRelease) {
            this.log.warn((0, outvariant_1.format)('found existing GitHub release for "%s": %s', tagName, existingRelease.html_url));
            return process.exit(1);
        }
        this.log.info((0, outvariant_1.format)('creating GitHub release for version "%s" in "%s/%s"...', tagName, repo.owner, repo.name));
        // Retrieve the information about the given release version.
        const tagPointer = await (0, getTag_1.getTag)(tagName);
        (0, outvariant_1.invariant)(tagPointer, 'Failed to create GitHub release: unknown tag "%s". Please make sure you are providing an existing release tag.', tagName);
        this.log.info((0, outvariant_1.format)('found release tag "%s" (%s)', tagPointer.tag, tagPointer.hash));
        const releaseCommit = await (0, getCommit_1.getCommit)(tagPointer.hash);
        (0, outvariant_1.invariant)(releaseCommit, 'Failed to create GitHub release: unable to retrieve the commit by tag "%s" (%s).', tagPointer.tag, tagPointer.hash);
        // Retrieve the pointer to the previous release.
        const tags = await (0, getTags_1.getTags)().then((tags) => {
            return tags.sort(getLatestRelease_1.byReleaseVersion);
        });
        const tagReleaseIndex = tags.indexOf(tagPointer.tag);
        const previousReleaseTag = tags[tagReleaseIndex + 1];
        const previousRelease = previousReleaseTag
            ? await (0, getTag_1.getTag)(previousReleaseTag)
            : undefined;
        if (previousRelease?.hash) {
            this.log.info((0, outvariant_1.format)('found preceding release "%s" (%s)', previousRelease.tag, previousRelease.hash));
        }
        else {
            this.log.info((0, outvariant_1.format)('found no released preceding "%s": analyzing all commits until "%s"...', tagPointer.tag, tagPointer.hash));
        }
        // Get commits list between the given release and the previous release.
        const commits = await (0, getCommits_1.getCommits)({
            since: previousRelease?.hash,
            until: tagPointer.hash,
        }).then(parseCommits_1.parseCommits);
        const context = {
            repo,
            nextRelease: {
                version,
                tag: tagPointer.tag,
                publishedAt: releaseCommit.author.date,
            },
            latestRelease: previousRelease,
        };
        // Generate release notes for the commits.
        const releaseNotes = await Notes.generateReleaseNotes(context, commits);
        this.log.info((0, outvariant_1.format)('generated release notes:\n%s', releaseNotes));
        // Create GitHub release.
        const release = await Notes.createRelease(context, releaseNotes);
        this.log.info((0, outvariant_1.format)('created GitHub release: %s', release.html_url));
    };
    static async generateReleaseNotes(context, commits) {
        const releaseNotes = await (0, getReleaseNotes_1.getReleaseNotes)(commits);
        const markdown = (0, toMarkdown_1.toMarkdown)(context, releaseNotes);
        return markdown;
    }
    static async createRelease(context, notes) {
        return (0, createGitHubRelease_1.createGitHubRelease)(context, notes);
    }
}
exports.Notes = Notes;
//# sourceMappingURL=notes.js.map