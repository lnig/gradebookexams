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
(0, node_test_1.suite)('subjectsRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.subjects.deleteMany();
    });
    (0, node_test_1.default)('createSubject() - success', async () => {
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        node_assert_1.default.strictEqual(createSubjectResponse.body.data.name, testData_1.subject1.name, `Expected the subject name to be "${testData_1.subject1.name}".`);
    });
    (0, node_test_1.default)('createSubject() - validation error', async () => {
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createSubjectResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('createSubject() - subject already exists', async () => {
        const createSubjectResponse1 = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSubjectResponse2 = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse2.statusCode, 409, 'Expected the status code to be 409 for a subject that already exists.');
    });
    (0, node_test_1.default)('getSubjects() - success', async () => {
        const createSubjectResponse1 = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSubjectResponse2 = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject2);
        node_assert_1.default.strictEqual(createSubjectResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const getSubjectsResponse = await (0, requestHelpers_1.sendGetRequest)('/subject');
        node_assert_1.default.strictEqual(getSubjectsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subjects retrieval.');
        node_assert_1.default.strictEqual(getSubjectsResponse.body.data.length, 2, 'Expected the number of subjects in the response to be 2.');
    });
    (0, node_test_1.default)('updateSubject() - success', async () => {
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const updateSubjectResponse = await (0, requestHelpers_1.sendPatchRequest)(`/subject/${createSubjectResponse.body.data.id}`, { name: testData_1.subject2.name });
        node_assert_1.default.strictEqual(updateSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject update.');
        node_assert_1.default.strictEqual(updateSubjectResponse.body.data.name, testData_1.subject2.name, `Expected the updated subject name to be "${testData_1.subject2.name}".`);
    });
    (0, node_test_1.default)('updateSubject() - validation error', async () => {
        const updateSubjectResponse = await (0, requestHelpers_1.sendPatchRequest)(`/subject/${testData_1.invalidIdUrl}`, {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateSubjectResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateSubjectResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateSubject() - subject does not exist', async () => {
        const updateSubjectResponse = await (0, requestHelpers_1.sendPatchRequest)(`/subject/${testData_1.nonExistentId}`, { name: testData_1.subject1.name });
        node_assert_1.default.strictEqual(updateSubjectResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
    (0, node_test_1.default)('deleteSubject() - success', async () => {
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const deleteSubjectResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/subject/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject deletion.');
        node_assert_1.default.strictEqual(deleteSubjectResponse.body.data.id, createSubjectResponse.body.data.id, 'Expected the deleted subject ID to match the created subject ID.');
    });
    (0, node_test_1.default)('deleteSubject() - validation error', async () => {
        const deleteSubjectResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/subject/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteSubjectResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteSubjectResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteSubject() - subject does not exist', async () => {
        const deleteSubjectResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/subject/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteSubjectResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
});
