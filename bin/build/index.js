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
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = __importStar(require("yargs"));
const getConfig_1 = require("./utils/getConfig");
// Commands.
const show_1 = require("./commands/show");
const publish_1 = require("./commands/publish");
const notes_1 = require("./commands/notes");
const config = (0, getConfig_1.getConfig)();
yargs
    .usage('$0 <command> [options]')
    .command(publish_1.Publish.command, publish_1.Publish.description, publish_1.Publish.builder, (argv) => new publish_1.Publish(config, argv).run())
    .command(notes_1.Notes.command, notes_1.Notes.description, notes_1.Notes.builder, (argv) => {
    return new notes_1.Notes(config, argv).run();
})
    .command(show_1.Show.command, show_1.Show.description, show_1.Show.builder, (argv) => new show_1.Show(config, argv).run())
    .help().argv;
//# sourceMappingURL=index.js.map