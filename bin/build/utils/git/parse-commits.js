import { invariant } from "outvariant";
import { DeferredPromise } from "@open-draft/deferred-promise";
import { PassThrough } from "node:stream";
import { CommitParser, parseCommitsStream } from "conventional-commits-parser";

//#region src/utils/git/parse-commits.ts
const COMMIT_HEADER_APPENDIX_REGEXP = /^(.+)(!)(:)/g;
async function parseCommits(commits) {
	const through = new PassThrough();
	const commitMap = /* @__PURE__ */ new Map();
	for (const commit of commits) {
		commitMap.set(commit.subject, commit);
		const message = joinCommit(commit.subject, commit.body);
		through.write(message, "utf8");
	}
	through.end();
	const commitParser = new CommitParser();
	const parsingStreamPromise = new DeferredPromise();
	parsingStreamPromise.finally(() => {
		through.destroy();
	});
	const parsedCommits = [];
	through.pipe(parseCommitsStream()).on("error", (error) => parsingStreamPromise.reject(error)).on("data", (parsedCommit) => {
		let resolvedParsingResult = parsedCommit;
		if (!parsedCommit.header) return;
		let typeAppendix;
		if (COMMIT_HEADER_APPENDIX_REGEXP.test(parsedCommit.header)) {
			const headerWithoutAppendix = parsedCommit.header.replace(COMMIT_HEADER_APPENDIX_REGEXP, "$1$3");
			resolvedParsingResult = commitParser.parse(joinCommit(headerWithoutAppendix, parsedCommit.body));
			typeAppendix = "!";
		}
		const originalCommit = commitMap.get(parsedCommit.header);
		invariant(originalCommit, "Failed to parse commit \"%s\": no original commit found associated with header", parsedCommit.header);
		const commit = Object.assign({}, resolvedParsingResult, {
			hash: originalCommit.hash,
			typeAppendix
		});
		parsedCommits.push(commit);
	}).on("end", () => parsingStreamPromise.resolve(parsedCommits));
	return parsingStreamPromise;
}
function joinCommit(subject, body) {
	return [subject, body].filter(Boolean).join("\n");
}

//#endregion
export { parseCommits };