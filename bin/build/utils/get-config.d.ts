//#region src/utils/get-config.d.ts
interface Config {
  profiles: Array<ReleaseProfile>;
}
interface ReleaseProfile {
  name: string;
  /**
   * The publish script command.
   * @example npm publish $NEXT_VERSION
   * @example pnpm publish --no-git-checks
   */
  use: string;
  /**
   * Indicate a pre-release version.
   * Treat breaking changes as minor release versions.
   */
  prerelease?: boolean;
}
declare function getConfig(projectPath: string): Config;
//#endregion
export { Config, ReleaseProfile, getConfig };