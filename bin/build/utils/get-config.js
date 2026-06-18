import { log } from "../logger.js";
import schema_default from "../schema.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { InvariantError, invariant } from "outvariant";
import { Ajv } from "ajv";

//#region src/utils/get-config.ts
function getConfig(projectPath) {
	const configPath = path.join(projectPath, "release.config.json");
	invariant(fs.existsSync(configPath), "Failed to resolve release configuration at \"%s\": the configuration file is missing", configPath);
	const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
	validateConfig(config, configPath);
	return config;
}
function validateConfig(config, configPath) {
	const validateConfig$1 = new Ajv({
		strictSchema: true,
		validateSchema: true
	}).compile(schema_default);
	if (!validateConfig$1(config)) {
		validateConfig$1.errors?.forEach((error) => {
			log.error(error);
		});
		throw new InvariantError("Failed to validate release configuration at \"%s\": the configuration is invalid. Please see the validation errors above for more details.", configPath);
	}
}

//#endregion
export { getConfig };