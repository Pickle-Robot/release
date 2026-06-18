import { ParsedCommitWithHash } from "../git/parse-commits.js";

//#region src/utils/github/get-commit-authors.d.ts
interface GetCommitAuthorsQuery {
  repository: {
    pullRequest: {
      url: string;
      author: {
        login: string;
      };
      commits: {
        nodes: Array<{
          commit: {
            authors: {
              nodes: Array<{
                user: {
                  login: string;
                };
              }>;
            };
          };
        }>;
      };
    };
  };
}
/**
 * Get a list of GitHub usernames who have contributed
 * to the given release commit. This analyzes all the commit
 * authors in the pull request referenced by the given commit.
 */
declare function getCommitAuthors(commit: ParsedCommitWithHash): Promise<Set<string>>;
//#endregion
export { GetCommitAuthorsQuery, getCommitAuthors };