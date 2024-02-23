"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommits = void 0;
const node_stream_1 = require("node:stream");
const outvariant_1 = require("outvariant");
const deferred_promise_1 = require("@open-draft/deferred-promise");
const conventional_commits_parser_1 = __importDefault(require("conventional-commits-parser"));
const COMMIT_HEADER_APPENDIX_REGEXP = /^(.+)(!)(:)/g;
async function parseCommits(commits) {
    const through = new node_stream_1.PassThrough();
    const commitMap = new Map();
    for (const commit of commits) {
        commitMap.set(commit.subject, commit);
        const message = joinCommit(commit.subject, commit.body);
        through.write(message, 'utf8');
    }
    through.end();
    const commitParser = (0, conventional_commits_parser_1.default)();
    const parsingStreamPromise = new deferred_promise_1.DeferredPromise();
    parsingStreamPromise.finally(() => {
        through.destroy();
    });
    const parsedCommits = [];
    through
        .pipe(commitParser)
        .on('error', (error) => parsingStreamPromise.reject(error))
        .on('data', (parsedCommit) => {
        let resolvedParsingResult = parsedCommit;
        if (!parsedCommit.header) {
            return;
        }
        let typeAppendix;
        if (COMMIT_HEADER_APPENDIX_REGEXP.test(parsedCommit.header)) {
            const headerWithoutAppendix = parsedCommit.header.replace(COMMIT_HEADER_APPENDIX_REGEXP, '$1$3');
            resolvedParsingResult = conventional_commits_parser_1.default.sync(joinCommit(headerWithoutAppendix, parsedCommit.body));
            typeAppendix = '!';
        }
        const originalCommit = commitMap.get(parsedCommit.header);
        (0, outvariant_1.invariant)(originalCommit, 'Failed to parse commit "%s": no original commit found associated with header', parsedCommit.header);
        const commit = Object.assign({}, resolvedParsingResult, {
            hash: originalCommit.hash,
            typeAppendix,
        });
        parsedCommits.push(commit);
    })
        .on('end', () => parsingStreamPromise.resolve(parsedCommits));
    return parsingStreamPromise;
}
exports.parseCommits = parseCommits;
function joinCommit(subject, body) {
    return [subject, body].filter(Boolean).join('\n');
}
//# sourceMappingURL=parseCommits.js.map