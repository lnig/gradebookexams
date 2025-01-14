"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validateEnv_1 = require("./modules/validateEnv");
const server_js_1 = __importDefault(require("./server.js"));
server_js_1.default.listen(validateEnv_1.PORT, () => {
    console.log(`Server running on port ${validateEnv_1.PORT}.`);
});
