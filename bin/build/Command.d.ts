import { log } from "./logger.js";
import { Config } from "./utils/get-config.js";
import { BuilderCallback } from "yargs";

//#region src/Command.d.ts
interface DefaultArgv {
  _: (number | string)[];
}
declare abstract class Command<Argv extends Record<string, any> = {}> {
  protected readonly config: Config;
  protected readonly argv: DefaultArgv & Argv;
  static readonly command: string;
  static readonly description: string;
  static readonly builder: BuilderCallback<{}, any>;
  protected log: typeof log;
  constructor(config: Config, argv: DefaultArgv & Argv);
  run: () => Promise<void>;
}
//#endregion
export { Command, DefaultArgv };