import { GitInfo } from "../git/get-info.js";

//#region src/utils/github/validate-access-token.d.ts
type GitHubTokenType = 'classic' | 'fine-grained';
type GitHubRepo = Pick<GitInfo, 'owner' | 'name'>;
declare function getGitHubTokenType(accessToken: string): GitHubTokenType;
declare const requiredGitHubTokenScopes: Array<string>;
declare const GITHUB_NEW_TOKEN_URL: string;
interface FineGrainedTokenPermission {
  permission: string;
  access: 'read' | 'write';
  /**
   * Check whether the given access token is granted this permission.
   */
  probe: (accessToken: string, repo: GitHubRepo) => Promise<boolean>;
}
declare const requiredFineGrainedTokenPermissions: Array<FineGrainedTokenPermission>;
declare const GITHUB_NEW_FINE_GRAINED_TOKEN_URL: string;
/**
 * Check whether the given GitHub access token has sufficient permissions
 * for this library to create and publish a new release.
 */
declare function validateAccessToken(accessToken: string): Promise<void>;
/**
 * Check whether the given classic GitHub access token (OAuth)
 * has sufficient permission scopes.
 */
declare function validateClassicAccessToken(accessToken: string): Promise<void>;
/**
 * Check whether the given fine-grained GitHub access token has
 * sufficient permissions for the given repository.
 */
declare function validateFineGrainedAccessToken(accessToken: string, repo: GitHubRepo): Promise<void>;
//#endregion
export { FineGrainedTokenPermission, GITHUB_NEW_FINE_GRAINED_TOKEN_URL, GITHUB_NEW_TOKEN_URL, GitHubRepo, GitHubTokenType, getGitHubTokenType, requiredFineGrainedTokenPermissions, requiredGitHubTokenScopes, validateAccessToken, validateClassicAccessToken, validateFineGrainedAccessToken };