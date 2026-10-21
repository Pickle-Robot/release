import { getConfig } from "./utils/get-config.js";
import { Show } from "./commands/show.js";
import { Notes } from "./commands/notes.js";
import { Publish } from "./commands/publish.js";
import yargs from "yargs";

//#region src/index.ts
const config = getConfig(process.cwd());
yargs(process.argv.slice(2)).usage("$0 <command> [options]").command(Publish.command, Publish.description, Publish.builder, (argv) => new Publish(config, argv).run()).command(Notes.command, Notes.description, Notes.builder, (argv) => {
	return new Notes(config, argv).run();
}).command(Show.command, Show.description, Show.builder, (argv) => new Show(config, argv).run()).help().argv;

//#endregion
export {  };