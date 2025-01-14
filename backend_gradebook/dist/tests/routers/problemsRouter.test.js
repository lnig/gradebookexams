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
(0, node_test_1.suite)('problemsRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.problems_gradebook.deleteMany();
        await db_1.default.students.deleteMany();
        await db_1.default.statuses.deleteMany();
        await db_1.default.problem_types.deleteMany();
        await db_1.default.user_types.deleteMany();
    });
    (0, node_test_1.default)('createProblem() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status2);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            ...testData_1.problem1,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        node_assert_1.default.strictEqual(createProblemResponse.body.data.description, testData_1.problem1.description, `Expected the problem description to be "${testData_1.problem1.description}".`);
        node_assert_1.default.strictEqual(createProblemResponse.body.data.problem_type_id, createProblemTypeResponse.body.data.id, `Expected the problem type ID to match the created problem type ID.`);
        node_assert_1.default.strictEqual(createProblemResponse.body.data.reporter_id, signUpResponse.body.data, `Expected the user ID to match the created user ID.`);
        node_assert_1.default.strictEqual(createProblemResponse.body.data.user_type_id, createUserTypeResponse.body.data.id, 'Expected the user type ID to match the created user type ID.');
        node_assert_1.default.strictEqual(createProblemResponse.body.data.status_id, createStatusResponse.body.data.id, 'Expected the status ID to match the created status ID.');
    });
    (0, node_test_1.default)('createProblem() - validation error', async () => {
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            description: testData_1.emptyString,
            problemTypeId: testData_1.emptyString,
            reporterId: testData_1.emptyString,
            userTypeId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createProblemResponse.body.errors.length, 4, 'Expected the number of validation errors to be 4.');
    });
    (0, node_test_1.default)('createProblem() - problem type does not exist', async () => {
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            description: testData_1.problem1.description,
            problemTypeId: testData_1.nonExistentId,
            reporterId: testData_1.nonExistentId,
            userTypeId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a problem type that does not exist.');
    });
    (0, node_test_1.default)('createProblem() - user type does not exist', async () => {
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            description: testData_1.problem1.description,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: testData_1.nonExistentId,
            userTypeId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a user type that does not exist.');
    });
    (0, node_test_1.default)('createProblem() - status does not exist', async () => {
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            description: testData_1.problem1.description,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: testData_1.nonExistentId,
            userTypeId: createUserTypeResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a status that does not exist.');
    });
    (0, node_test_1.default)('createProblem() - user does not exist', async () => {
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status2);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            description: testData_1.problem1.description,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: testData_1.nonExistentId,
            userTypeId: createUserTypeResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });
    (0, node_test_1.default)('getProblems() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status2);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createProblemTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createProblemTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType2);
        node_assert_1.default.strictEqual(createProblemTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const createProblemResponse1 = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            ...testData_1.problem1,
            problemTypeId: createProblemTypeResponse1.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
        });
        node_assert_1.default.strictEqual(createProblemResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        const createProblemResponse2 = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            ...testData_1.problem2,
            problemTypeId: createProblemTypeResponse2.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
        });
        node_assert_1.default.strictEqual(createProblemResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        const getProblemsResponse = await (0, requestHelpers_1.sendGetRequest)(`/problem`);
        node_assert_1.default.strictEqual(getProblemsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problems retrieval.');
        node_assert_1.default.strictEqual(getProblemsResponse.body.data.length, 2, 'Expected the number of retrieved problems to be 2.');
    });
    (0, node_test_1.default)('getProblemsByType() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status2);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createProblemTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createProblemTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType2);
        node_assert_1.default.strictEqual(createProblemTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const createProblemResponse1 = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            ...testData_1.problem1,
            problemTypeId: createProblemTypeResponse1.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
        });
        node_assert_1.default.strictEqual(createProblemResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        const createProblemResponse2 = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            ...testData_1.problem2,
            problemTypeId: createProblemTypeResponse2.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
        });
        node_assert_1.default.strictEqual(createProblemResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        const getProblemsResponse = await (0, requestHelpers_1.sendGetRequest)(`/problem/${createProblemTypeResponse1.body.data.id}`);
        node_assert_1.default.strictEqual(getProblemsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problems retrieval.');
        node_assert_1.default.strictEqual(getProblemsResponse.body.data.length, 1, 'Expected the number of retrieved problems to be 1.');
    });
    (0, node_test_1.default)('getProblemsByType() - validation error', async () => {
        const getProblemsResponse = await (0, requestHelpers_1.sendGetRequest)(`/problem/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getProblemsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getProblemsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getProblemsByType() - problem type does not exist', async () => {
        const getProblemsResponse = await (0, requestHelpers_1.sendGetRequest)(`/problem/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getProblemsResponse.statusCode, 404, 'Expected the status code to be 404 for a problem type that does not exist.');
    });
    (0, node_test_1.default)('updateProblem() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status2);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            ...testData_1.problem1,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
            statusId: createStatusResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        const updateProblemResponse = await (0, requestHelpers_1.sendPatchRequest)(`/problem/${createProblemResponse.body.data.id}`, {
            statusId: createStatusResponse.body.data.id
        });
        node_assert_1.default.strictEqual(updateProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem update.');
        node_assert_1.default.strictEqual(updateProblemResponse.body.data.status_id, createStatusResponse.body.data.id, `Expected the updated status ID to match the created status ID.`);
    });
    (0, node_test_1.default)('updateProblem() - validation error', async () => {
        const updateProblemResponse = await (0, requestHelpers_1.sendPatchRequest)(`/problem/${testData_1.invalidIdUrl}`, {
            statusId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateProblemResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateProblemResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateProblem() - problem does not exist', async () => {
        const updateExamResponse = await (0, requestHelpers_1.sendPatchRequest)(`/problem/${testData_1.nonExistentId}`, {
            statusId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(updateExamResponse.statusCode, 404, 'Expected the status code to be 404 for a problem that does not exist.');
    });
    (0, node_test_1.default)('updateProblem() - status does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status2);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            ...testData_1.problem1,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id,
            statusId: createStatusResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        const updateProblemResponse = await (0, requestHelpers_1.sendPatchRequest)(`/problem/${createProblemResponse.body.data.id}`, {
            statusId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(updateProblemResponse.statusCode, 404, 'Expected the status code to be 404 for a status that does not exist.');
    });
    (0, node_test_1.default)('deleteProblem() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createStatusResponse = await (0, requestHelpers_1.sendPostRequest)('/status', testData_1.status2);
        node_assert_1.default.strictEqual(createStatusResponse.statusCode, 200, 'Expected the status code to be 200 for a successful status creation.');
        const createProblemTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/problem-type', testData_1.problemType1);
        node_assert_1.default.strictEqual(createProblemTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem type creation.');
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const createProblemResponse = await (0, requestHelpers_1.sendPostRequest)('/problem', {
            ...testData_1.problem1,
            problemTypeId: createProblemTypeResponse.body.data.id,
            reporterId: signUpResponse.body.data,
            userTypeId: createUserTypeResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem creation.');
        const deleteProblemResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/problem/${createProblemResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteProblemResponse.statusCode, 200, 'Expected the status code to be 200 for a successful problem deletion.');
        node_assert_1.default.strictEqual(deleteProblemResponse.body.data.id, createProblemResponse.body.data.id, 'Expected the deleted problem ID to match the created problem ID.');
    });
    (0, node_test_1.default)('deleteProblem() - validation error', async () => {
        const deleteProblemResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/problem/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteProblemResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteProblemResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteProblem() - problem does not exist', async () => {
        const deleteProblemResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/problem/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteProblemResponse.statusCode, 404, 'Expected the status code to be 404 for an problem that does not exist.');
    });
});
