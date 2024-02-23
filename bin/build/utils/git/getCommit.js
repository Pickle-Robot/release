"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommit = void 0;
const getStream = __importStar(require("get-stream"));
const git_log_parser_1 = __importDefault(require("git-log-parser"));
const execAsync_1 = require("../execAsync");
async function getCommit(hash) {
    Object.assign(git_log_parser_1.default.fields, {
        hash: 'H',
        message: 'B',
    });
    const result = await getStream.array(git_log_parser_1.default.parse({
        _: hash,
        n: 1,
    }, {
        // Respect the global working directory so this command
        // parses commits on test repositories during tests.
        cwd: execAsync_1.execAsync.contextOptions.cwd,
    }));
    return result?.[0];
}
exports.getCommit = getCommit;
//# sourceMappingURL=getCommit.js.map