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
const db_1 = __importDefault(require("../../src/db"));
const node_test_1 = __importStar(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const requestHelpers_1 = require("../../src/utils/requestHelpers");
const testData_1 = require("../../src/utils/testData");
(0, node_test_1.suite)('statusesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.statuses.deleteMany();
    });
    (0, node_test_1.default)('createStatus() - success', async () => {
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status1);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        node_assert_1.default.strictEqual(createStatusResponse.body.data.name, testData_1.status1.name, `Expected the status name to be "${testData_1.status1.name}".`);
    });
    (0, node_test_1.default)('createStatus() - validation error', async () => {
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createStatusResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('createStatus() - status already exists', async () => {
        const createStatusResponse1 = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status1);
        node_assert_1.default.strictEqual(createStatusResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createStatusResponse2 = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status1);
        node_assert_1.default.strictEqual(createStatusResponse2.statusCode, 409, 'Expected the status code to be 409 for a status that already exists.');
    });
    (0, node_test_1.default)('getStatus() - success', async () => {
        const createStatusResponse1 = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status1);
        node_assert_1.default.strictEqual(createStatusResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createStatusResponse2 = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status2);
        node_assert_1.default.strictEqual(createStatusResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const getStatusesResponse = await (0, requestHelpers_1.sendGetRequest)('/status');
        node_assert_1.default.strictEqual(getStatusesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful statuses retrieval.');
        node_assert_1.default.strictEqual(getStatusesResponse.body.data.length, 2, 'Expected the number of retrieved statuses to be 2.');
    });
    (0, node_test_1.default)('deleteStatus() - success', async () => {
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status1);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const deleteStatusResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/status/${createStatusResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status deletion.');
        node_assert_1.default.strictEqual(deleteStatusResponse.body.data.id, createStatusResponse.body.data.id, 'Expected the deleted status ID to match the created status ID.');
    });
    (0, node_test_1.default)('deleteStatus() - validation error', async () => {
        const deleteStatusResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/status/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteStatusResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteStatusResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteStatus() - status does not exist', async () => {
        const deleteStatusResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/status/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteStatusResponse.statusCode, 404, 'Expected the status code to be 404 for a status that does not exist.');
    });
});
