"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Show = exports.ReleaseStatus = void 0;
const outvariant_1 = require("outvariant");
const node_fetch_1 = __importDefault(require("node-fetch"));
const Command_1 = require("../Command");
const getTag_1 = require("../utils/git/getTag");
const getLatestRelease_1 = require("../utils/git/getLatestRelease");
const getTags_1 = require("../utils/git/getTags");
const getCommit_1 = require("../utils/git/getCommit");
const getInfo_1 = require("../utils/git/getInfo");
const execAsync_1 = require("../utils/execAsync");
const env_1 = require("../utils/env");
var ReleaseStatus;
(function (ReleaseStatus) {
    /**
     * Release is public and available for everybody to see
     * on the GitHub releases page.
     */
    ReleaseStatus["Public"] = "public";
    /**
     * Release is pushed to GitHub but is marked as draft.
     */
    ReleaseStatus["Draft"] = "draft";
    /**
     * Release is local, not present on GitHub.
     */
    ReleaseStatus["Unpublished"] = "unpublished";
})(ReleaseStatus = exports.ReleaseStatus || (exports.ReleaseStatus = {}));
class Show extends Command_1.Command {
    static command = 'show';
    static description = 'Show release info';
    static builder = (yargs) => {
        return yargs
            .usage('$0 show [tag]')
            .example([
            ['$0 show', 'Show the latest release info'],
            ['$0 show 1.2.3', 'Show specific release tag info'],
        ])
            .positional('tag', {
            type: 'string',
            description: 'Release tag',
            demandOption: false,
        });
    };
    run = async () => {
        await (0, env_1.demandGitHubToken)().catch((error) => {
            this.log.error(error.message);
            process.exit(1);
        });
        const [, tag] = this.argv._;
        const pointer = await this.getTagPointer(tag?.toString());
        this.log.info((0, outvariant_1.format)('found tag "%s"!', pointer.tag));
        const commit = await (0, getCommit_1.getCommit)(pointer.hash);
        (0, outvariant_1.invariant)(commit, 'Failed to retrieve release info for tag "%s": cannot find commit associated with the tag.', tag);
        // Print local Git info about the release commit.
        const commitOut = await (0, execAsync_1.execAsync)(`git log -1 ${commit.commit.long}`).then(({ stdout }) => stdout);
        this.log.info(commitOut);
        // Print the remote GitHub info about the release.
        const repo = await (0, getInfo_1.getInfo)();
        const releaseResponse = await (0, node_fetch_1.default)(`https://api.github.com/repos/${repo.owner}/${repo.name}/releases/tags/${pointer.tag}`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        });
        const isPublishedRelease = releaseResponse.status === 200;
        const release = await releaseResponse.json();
        const releaseStatus = isPublishedRelease
            ? release.draft
                ? ReleaseStatus.Draft
                : ReleaseStatus.Public
            : ReleaseStatus.Unpublished;
        this.log.info((0, outvariant_1.format)('release status: %s', releaseStatus));
        if (releaseStatus === ReleaseStatus.Public ||
            releaseStatus === ReleaseStatus.Draft) {
            this.log.info((0, outvariant_1.format)('release url: %s', release?.html_url));
        }
        if (!isPublishedRelease) {
            this.log.warn((0, outvariant_1.format)('release "%s" is not published to GitHub!', pointer.tag));
        }
    };
    /**
     * Returns tag pointer by the given tag name.
     * If no tag name was given, looks up the latest release tag
     * and returns its pointer.
     */
    async getTagPointer(tag) {
        if (tag) {
            this.log.info((0, outvariant_1.format)('looking up explicit "%s" tag...', tag));
            const pointer = await (0, getTag_1.getTag)(tag);
            (0, outvariant_1.invariant)(pointer, 'Failed to retrieve release tag: tag "%s" does not exist.', tag);
            return pointer;
        }
        this.log.info('looking up the latest release tag...');
        const tags = await (0, getTags_1.getTags)();
        (0, outvariant_1.invariant)(tags.length > 0, 'Failed to retrieve release tag: repository has no releases.');
        const latestPointer = await (0, getLatestRelease_1.getLatestRelease)(tags);
        (0, outvariant_1.invariant)(latestPointer, 'Failed to retrieve release tag: cannot retrieve releases.');
        return latestPointer;
    }
}
exports.Show = Show;
//# sourceMappingURL=show.js.map