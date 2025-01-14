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
(0, node_test_1.suite)('questionTypesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.questions_types.deleteMany();
    });
    (0, node_test_1.default)('createQuestionType() - success', async () => {
        const createQuestionTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        node_assert_1.default.strictEqual(createQuestionTypeResponse.body.data.name, testData_1.questionType1.name, `Expected the status name to be "${testData_1.questionType1.name}".`);
    });
    (0, node_test_1.default)('createQuestionType() - validation error', async () => {
        const createQuestionTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/question-type', {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createQuestionTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createQuestionTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('createQuestionType() - question type already exists', async () => {
        const createQuestionTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createQuestionTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse2.statusCode, 409, 'Expected the status code to be 409 for a question type that already exists.');
    });
    (0, node_test_1.default)('getQuestionTypes() - success', async () => {
        const createQuestionTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createQuestionTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType2);
        node_assert_1.default.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const getQuestionTypesResponse = await (0, requestHelpers_1.sendGetRequest)('/question-type');
        node_assert_1.default.strictEqual(getQuestionTypesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful question types retrieval.');
        node_assert_1.default.strictEqual(getQuestionTypesResponse.body.data.length, 2, 'Expected the number of retrieved question types to be 2.');
    });
    (0, node_test_1.default)('deleteQuestionType() - success', async () => {
        const createQuestionTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const deleteQuestionTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/question-type/${createQuestionTypeResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteQuestionTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful question type deletion.');
        node_assert_1.default.strictEqual(deleteQuestionTypeResponse.body.data.id, createQuestionTypeResponse.body.data.id, 'Expected the deleted question type ID to match the created question type ID.');
    });
    (0, node_test_1.default)('deleteQuestionType() - validation error', async () => {
        const deleteQuestionTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/question-type/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteQuestionTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteQuestionTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteQuestionType() - question type does not exist', async () => {
        const deleteQuestionTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/question-type/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteQuestionTypeResponse.statusCode, 404, 'Expected the status code to be 404 for a question type that does not exist.');
    });
});
