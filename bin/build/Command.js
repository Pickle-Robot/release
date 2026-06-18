import { log } from "./logger.js";

//#region src/Command.ts
var Command = class {
	static command;
	static description;
	static builder = () => {};
	log;
	constructor(config, argv) {
		this.config = config;
		this.argv = argv;
		this.log = log;
	}
	run = async () => {};
};

//#endregion
export { Command };