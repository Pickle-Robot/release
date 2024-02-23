"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bumpPackageJson = void 0;
const readPackageJson_1 = require("./readPackageJson");
const writePackageJson_1 = require("./writePackageJson");
function bumpPackageJson(version) {
    const packageJson = (0, readPackageJson_1.readPackageJson)();
    packageJson.version = version;
    (0, writePackageJson_1.writePackageJson)(packageJson);
}
exports.bumpPackageJson = bumpPackageJson;
//# sourceMappingURL=bumpPackageJson.js.map