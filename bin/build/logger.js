import pino from "pino";

//#region src/logger.ts
const log = pino({
	base: null,
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			timestampKey: false
		}
	}
});

//#endregion
export { log };