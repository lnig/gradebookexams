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
(0, node_test_1.suite)('classNamesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.class_names.deleteMany();
    });
    (0, node_test_1.default)('createClassName() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        node_assert_1.default.strictEqual(createClassNameResponse.body.data.name, testData_1.className1.name, `Expected the class name to be "${testData_1.className1.name}".`);
    });
    (0, node_test_1.default)('createClassName() - validation error', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createClassNameResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('createClassName() - class name already exists', async () => {
        const createClassNameResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createClassNameResponse2 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse2.statusCode, 409, 'Expected the status code to be 409 for a class name that already exists.');
    });
    (0, node_test_1.default)('getClassNames() - success', async () => {
        const createClassNameResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createClassNameResponse2 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className2);
        node_assert_1.default.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const getClassNamesResponse = await (0, requestHelpers_1.sendGetRequest)('/class-name');
        node_assert_1.default.strictEqual(getClassNamesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class names retrieval.');
        node_assert_1.default.strictEqual(getClassNamesResponse.body.data.length, 2, 'Expected the number of class names in the response to be 2.');
    });
    (0, node_test_1.default)('updateClassName() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        0;
        const updateClassNameResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class-name/${createClassNameResponse.body.data.id}`, { name: testData_1.className2.name });
        node_assert_1.default.strictEqual(updateClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name update.');
        node_assert_1.default.strictEqual(updateClassNameResponse.body.data.name, testData_1.className2.name, `Expected the updated class name to be "${testData_1.className2.name}".`);
    });
    (0, node_test_1.default)('updateClassName() - validation error', async () => {
        const updateClassNameResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class-name/${testData_1.invalidIdUrl}`, {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateClassNameResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateClassNameResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateClassName() - class name does not exist', async () => {
        const updateClassNameResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class-name/${testData_1.nonExistentId}`, { name: testData_1.className2.name });
        node_assert_1.default.strictEqual(updateClassNameResponse.statusCode, 404, 'Expected the status code to be 404 for a class name that does not exist.');
    });
    (0, node_test_1.default)('deleteClassName() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const deleteClassNameResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/class-name/${createClassNameResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name deletion.');
        node_assert_1.default.strictEqual(deleteClassNameResponse.body.data.id, createClassNameResponse.body.data.id, 'Expected the deleted class name ID to match the created class name ID.');
    });
    (0, node_test_1.default)('deleteClassName() - validation error', async () => {
        const deleteClassNameResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/class-name/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteClassNameResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteClassNameResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteClassName() - class name does not exist', async () => {
        const deleteClassNameResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/class-name/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteClassNameResponse.statusCode, 404, 'Expected the status code to be 404 for a class name that does not exist.');
    });
});
