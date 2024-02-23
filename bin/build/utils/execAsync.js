"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execAsync = void 0;
const deferred_promise_1 = require("@open-draft/deferred-promise");
const child_process_1 = require("child_process");
const DEFAULT_CONTEXT = {
    cwd: process.cwd(),
};
exports.execAsync = ((command, options = {}) => {
    const commandPromise = new deferred_promise_1.DeferredPromise();
    const io = (0, child_process_1.exec)(command, {
        ...exports.execAsync.contextOptions,
        ...options,
    }, (error, stdout, stderr) => {
        if (error) {
            return commandPromise.reject(error);
        }
        commandPromise.resolve({
            stdout,
            stderr,
        });
    });
    // Set the reference to the spawned child process
    // on the promise so the consumer can either await
    // the entire command or tap into child process
    // and handle it manually (e.g. forward stdio).
    Reflect.set(commandPromise, 'io', io);
    return commandPromise;
});
exports.execAsync.mockContext = (options) => {
    exports.execAsync.contextOptions = options;
};
exports.execAsync.restoreContext = () => {
    exports.execAsync.contextOptions = DEFAULT_CONTEXT;
};
exports.execAsync.restoreContext();
//# sourceMappingURL=execAsync.js.map