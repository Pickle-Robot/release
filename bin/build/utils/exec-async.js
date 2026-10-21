import { exec } from "node:child_process";
import { DeferredPromise } from "@open-draft/deferred-promise";

//#region src/utils/exec-async.ts
const DEFAULT_CONTEXT = { cwd: process.cwd() };
const execAsync = ((command, options = {}) => {
	const commandPromise = new DeferredPromise();
	const io = exec(command, {
		...execAsync.contextOptions,
		...options
	}, (error, stdout, stderr) => {
		if (error) return commandPromise.reject(error);
		commandPromise.resolve({
			stdout: stdout.toString(),
			stderr: stderr.toString()
		});
	});
	Reflect.set(commandPromise, "io", io);
	return commandPromise;
});
execAsync.mockContext = (options) => {
	execAsync.contextOptions = options;
};
execAsync.restoreContext = () => {
	execAsync.contextOptions = DEFAULT_CONTEXT;
};
execAsync.restoreContext();

//#endregion
export { execAsync };