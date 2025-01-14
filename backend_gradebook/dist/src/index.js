"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateEnv_js_1 = require("./modules/validateEnv.js");
const server_js_1 = require("./server.js");
server_js_1.server.listen(validateEnv_js_1.PORT, () => {
    console.log(`Server running on port ${validateEnv_js_1.PORT}.`);
});
