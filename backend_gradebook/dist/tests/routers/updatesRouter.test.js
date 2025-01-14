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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../src/db"));
const node_test_1 = __importStar(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const requestHelpers_1 = require("../../src/utils/requestHelpers");
const testData_1 = require("../../src/utils/testData");
(0, node_test_1.suite)('updatesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.updates.deleteMany();
    });
    (0, node_test_1.default)('createUpdate() - success', async () => {
        const createUpdateResponse = await (0, requestHelpers_1.sendPostRequest)('/update', testData_1.update1);
        node_assert_1.default.strictEqual(createUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update creation.');
        node_assert_1.default.strictEqual(createUpdateResponse.body.data.description, testData_1.update1.description, `Expected the description to be "${testData_1.update1.description}".`);
        node_assert_1.default.strictEqual(createUpdateResponse.body.data.version, testData_1.update1.version, `Expected the version to be "${testData_1.update1.version}".`);
    });
    (0, node_test_1.default)('createUpdate() - validation error', async () => {
        const createUpdateResponse = await (0, requestHelpers_1.sendPostRequest)('/update', {
            description: testData_1.emptyString,
            version: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createUpdateResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createUpdateResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('createUpdate() - update already exists', async () => {
        const createUpdateResponse1 = await (0, requestHelpers_1.sendPostRequest)('/update', testData_1.update1);
        node_assert_1.default.strictEqual(createUpdateResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful update creation.');
        const createUpdateResponse2 = await (0, requestHelpers_1.sendPostRequest)('/update', testData_1.update1);
        node_assert_1.default.strictEqual(createUpdateResponse2.statusCode, 409, 'Expected the status code to be 409 for an update that already exists.');
    });
    (0, node_test_1.default)('updateUpdate() - success', async () => {
        const createUpdateResponse = await (0, requestHelpers_1.sendPostRequest)('/update', testData_1.update1);
        node_assert_1.default.strictEqual(createUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update creation.');
        const updateUpdateResponse = await (0, requestHelpers_1.sendPatchRequest)(`/update/${createUpdateResponse.body.data.id}`, {
            description: testData_1.update2.description,
            version: testData_1.update2.version
        });
        node_assert_1.default.strictEqual(updateUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update update.');
        node_assert_1.default.strictEqual(updateUpdateResponse.body.data.description, testData_1.update2.description, `Expected the description to be "${testData_1.update2.description}".`);
        node_assert_1.default.strictEqual(updateUpdateResponse.body.data.version, testData_1.update2.version, `Expected the version to be "${testData_1.update2.version}".`);
    });
    (0, node_test_1.default)('updateUpdate() - validation error', async () => {
        const updateUpdateResponse = await (0, requestHelpers_1.sendPatchRequest)(`/update/${testData_1.invalidIdUrl}`, {
            description: testData_1.emptyString,
            version: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateUpdateResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateUpdateResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateUpdate() - update does not exist', async () => {
        const updateUpdateResponse = await (0, requestHelpers_1.sendPatchRequest)(`/update/${testData_1.nonExistentId}`, {
            description: testData_1.update2.description,
            version: testData_1.update2.version
        });
        node_assert_1.default.strictEqual(updateUpdateResponse.statusCode, 404, 'Expected the status code to be 404 for an update that does not exist.');
    });
    (0, node_test_1.default)('deleteUpdate() - success', async () => {
        const createUpdateResponse = await (0, requestHelpers_1.sendPostRequest)('/update', testData_1.update1);
        node_assert_1.default.strictEqual(createUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update creation.');
        const deleteUpdateResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/update/${createUpdateResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteUpdateResponse.statusCode, 200, 'Expected the status code to be 200 for a successful update deletion.');
        node_assert_1.default.strictEqual(deleteUpdateResponse.body.data.id, createUpdateResponse.body.data.id, 'Expected the deleted update ID to match the created update ID.');
    });
    (0, node_test_1.default)('deleteUpdate() - validation error', async () => {
        const deleteUpdateResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/update/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteUpdateResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteUpdateResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteUpdate() - update does not exist', async () => {
        const deleteUpdateResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/update/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteUpdateResponse.statusCode, 404, 'Expected the status code to be 404 for an update that does not exist.');
    });
});
