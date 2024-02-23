"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const logger_1 = require("./logger");
class Command {
    config;
    argv;
    static command;
    static description;
    static builder = () => { };
    log;
    constructor(config, argv) {
        this.config = config;
        this.argv = argv;
        this.log = logger_1.log;
    }
    run = async () => { };
}
exports.Command = Command;
//# sourceMappingURL=Command.js.map