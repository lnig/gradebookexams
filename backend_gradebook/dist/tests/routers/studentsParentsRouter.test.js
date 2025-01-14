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
(0, node_test_1.suite)('studentsParentsRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.students_parents.deleteMany();
        await db_1.default.students.deleteMany();
        await db_1.default.parents.deleteMany();
    });
    (0, node_test_1.default)('createStudentParentRelationship() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/parent', testData_1.parent1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful parent signup.');
        const createRelationshipResponse = await (0, requestHelpers_1.sendPostRequest)('/student-parent', {
            studentId: signUpResponse1.body.data,
            parentId: signUpResponse2.body.data
        });
        node_assert_1.default.strictEqual(createRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for a successful assignment.');
        node_assert_1.default.strictEqual(createRelationshipResponse.body.data.student_id, signUpResponse1.body.data, 'Expected the student ID in the relationship to match the created student ID.');
        node_assert_1.default.strictEqual(createRelationshipResponse.body.data.parent_id, signUpResponse2.body.data, 'Expected the parent ID in the relationship to match the created parent ID.');
    });
    (0, node_test_1.default)('createStudentParentRelationship() - validation error', async () => {
        const createRelationshipResponse = await (0, requestHelpers_1.sendPostRequest)('/student-parent', {
            studentId: testData_1.emptyString,
            parentId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createRelationshipResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createRelationshipResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('createStudentParentRelationship() - student does not exist', async () => {
        const createRelationshipResponse = await (0, requestHelpers_1.sendPostRequest)('/student-parent', {
            studentId: testData_1.nonExistentId,
            parentId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('createStudentParentRelationship() - parent does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const createRelationshipResponse = await (0, requestHelpers_1.sendPostRequest)('/student-parent', {
            studentId: signUpResponse.body.data,
            parentId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for a parent that does not exist.');
    });
    (0, node_test_1.default)('createStudentParentRelationship() - parent already assigned to student', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/parent', testData_1.parent1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful parent signup.');
        const createRelationshipResponse1 = await (0, requestHelpers_1.sendPostRequest)('/student-parent', {
            studentId: signUpResponse1.body.data,
            parentId: signUpResponse2.body.data
        });
        node_assert_1.default.strictEqual(createRelationshipResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful assignment.');
        const createRelationshipResponse2 = await (0, requestHelpers_1.sendPostRequest)('/student-parent', {
            studentId: signUpResponse1.body.data,
            parentId: signUpResponse2.body.data
        });
        node_assert_1.default.strictEqual(createRelationshipResponse2.statusCode, 409, 'Expected the status code to be 409 for a student-parent relationship that already exists.');
    });
    (0, node_test_1.default)('deleteStudentParentRelationship() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/parent', testData_1.parent1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful parent signup.');
        const createRelationshipResponse = await (0, requestHelpers_1.sendPostRequest)('/student-parent', {
            studentId: signUpResponse1.body.data,
            parentId: signUpResponse2.body.data
        });
        node_assert_1.default.strictEqual(createRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for a successful assignment.');
        const deleteRelationshipResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/student-parent/${signUpResponse1.body.data}/${signUpResponse2.body.data}`);
        node_assert_1.default.strictEqual(deleteRelationshipResponse.statusCode, 200, 'Expected the status code to be 200 for a successful relationship deletion.');
        node_assert_1.default.strictEqual(deleteRelationshipResponse.body.data.student_id, createRelationshipResponse.body.data.student_id, 'Expected the deleted student ID to match the created student ID.');
        node_assert_1.default.strictEqual(deleteRelationshipResponse.body.data.parent_id, createRelationshipResponse.body.data.parent_id, 'Expected the deleted parent ID to match the created parent ID.');
    });
    (0, node_test_1.default)('deleteStudentParentRelationship() - validation error', async () => {
        const deleteRelationshipResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/student-parent/${testData_1.invalidIdUrl}/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteRelationshipResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteRelationshipResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('deleteStudentParentRelationship() - student does not exist', async () => {
        const deleteRelationshipResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/student-parent/${testData_1.nonExistentId}/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('deleteStudentParentRelationship() - parent does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const deleteRelationshipResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/student-parent/${signUpResponse.body.data}/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for a parent that does not exist.');
    });
    (0, node_test_1.default)('deleteStudentParentRelationship() - relationship does not exist', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/parent', testData_1.parent1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful parent signup.');
        const deleteRelationshipResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/student-parent/${signUpResponse1.body.data}/${signUpResponse2.body.data}`);
        node_assert_1.default.strictEqual(deleteRelationshipResponse.statusCode, 404, 'Expected the status code to be 404 for a relationship that does not exist.');
    });
});
