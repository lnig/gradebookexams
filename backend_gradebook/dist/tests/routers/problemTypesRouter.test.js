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
(0, node_test_1.suite)('problemTypesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.problem_types.deleteMany();
    });
    (0, node_test_1.default)('createProblemType() - success', async () => {
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        node_assert_1.default.strictEqual(createProblemTypeResponse.body.data.name, testData_1.problemType1.name, `Expected the problem type name to be "${testData_1.problemType1.name}".`);
    });
    (0, node_test_1.default)('createProblemType() - validation error', async () => {
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createProblemTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('createProblemType() - problem type already exists', async () => {
        const createProblemTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createProblemTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse2.statusCode, 409, 'Expected the status code to be 409 for a problem type that already exists.');
    });
    (0, node_test_1.default)('deleteProblemType() - success', async () => {
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const deleteProblemTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/problem-type/${createProblemTypeResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type deletion.');
        node_assert_1.default.strictEqual(deleteProblemTypeResponse.body.data.id, createProblemTypeResponse.body.data.id, 'Expected the deleted problem type ID to match the created problem type ID.');
    });
    (0, node_test_1.default)('deleteProblemType() - validation error', async () => {
        const deleteProblemTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/problem-type/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteProblemTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteProblemTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteProblemType() - status does not exist', async () => {
        const deleteProblemTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/problem-type/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteProblemTypeResponse.statusCode, 404, 'Expected the status code to be 404 for a problem type that does not exist.');
    });
});
