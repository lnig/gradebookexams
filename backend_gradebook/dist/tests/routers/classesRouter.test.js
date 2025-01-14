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
(0, node_test_1.suite)('classesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.students.deleteMany();
        await db_1.default.classes.deleteMany();
        await db_1.default.teachers.deleteMany();
        await db_1.default.class_names.deleteMany();
        await db_1.default.school_years.deleteMany();
    });
    (0, node_test_1.default)('createClass() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        node_assert_1.default.strictEqual(createClassResponse.body.data.class_name_id, createClassNameResponse.body.data.id, 'Expected the class name ID to match the created class name ID.');
        node_assert_1.default.strictEqual(createClassResponse.body.data.school_year_id, createSchoolYearResponse.body.data.id, 'Expected the school year ID to match the created school year ID.');
    });
    (0, node_test_1.default)('createClass() - validation error', async () => {
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: testData_1.emptyString,
            schoolYearId: testData_1.emptyString,
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createClassResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('createClass() - class name does not exist', async () => {
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: testData_1.nonExistentId,
            schoolYearId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class name that does not exist.');
    });
    (0, node_test_1.default)('createClass() - school year does not exist', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 404, 'Expected the status code to be 200 for a school year does not exist.');
    });
    (0, node_test_1.default)('createClass() - class already exists', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const createClassResponse2 = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse2.statusCode, 409, 'Expected the status code to be 409 for a class that already exists.');
    });
    (0, node_test_1.default)('getClasses() - success', async () => {
        const createClassNameResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createClassNameResponse2 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className2);
        node_assert_1.default.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const createClassResponse2 = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse2.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const getClassesResponse = await (0, requestHelpers_1.sendGetRequest)('/class');
        node_assert_1.default.strictEqual(getClassesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful classes retrieval.');
        node_assert_1.default.strictEqual(getClassesResponse.body.data.length, 2, 'Expected the number of retrieved classes to be 2.');
    });
    (0, node_test_1.default)('getClassById() - success', async () => {
        const createClassNameResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const getClassByIdResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/${createClassResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getClassByIdResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class retrieval.');
        node_assert_1.default.strictEqual(getClassByIdResponse.body.data.id, createClassResponse.body.data.id, 'Expected the class ID to match the created class ID.');
        node_assert_1.default.strictEqual(getClassByIdResponse.body.data.class_name_id, createClassResponse.body.data.class_name_id, 'Expected the class name ID to match the created class name ID.');
        node_assert_1.default.strictEqual(getClassByIdResponse.body.data.school_year_id, createClassResponse.body.data.school_year_id, 'Expected the school year ID to match the created school year ID.');
    });
    (0, node_test_1.default)('getClassById() - validation error', async () => {
        const getClassByIdResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getClassByIdResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getClassByIdResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getClassById() - class does not exist', async () => {
        const getClassByIdResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getClassByIdResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('getStudents() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const assignStudentResponse1 = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse1.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const assignStudentResponse2 = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse2.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const getStudentsResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/students/${createClassResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getStudentsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful students retrieval.');
        node_assert_1.default.strictEqual(getStudentsResponse.body.data.length, 2, 'Expected the number of retrieved students to be 2.');
    });
    (0, node_test_1.default)('getStudents() - validation error', async () => {
        const getStudentsResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/students/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getStudentsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getStudentsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getStudents() - class does not exist', async () => {
        const getStudentsResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/students/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getStudentsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('getStudentClassId() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const assignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const getStudentClassIdResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/student/${signUpResponse.body.data}`);
        node_assert_1.default.strictEqual(getStudentClassIdResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student\'s class ID retrieval.');
        node_assert_1.default.strictEqual(getStudentClassIdResponse.body.data, createClassResponse.body.data.id, 'Expected the class ID to match the created class ID.');
    });
    (0, node_test_1.default)('getStudentClassId() - validation error', async () => {
        const getStudentsResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/student/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getStudentsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getStudentsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getStudentClassId() - student does not exist', async () => {
        const getStudentsResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/student/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getStudentsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('getStudentClassId() - student is not assigned to any class', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const getStudentClassIdResponse = await (0, requestHelpers_1.sendGetRequest)(`/class/student/${signUpResponse.body.data}`);
        node_assert_1.default.strictEqual(getStudentClassIdResponse.statusCode, 404, 'Expected the status code to be 404 for a student that is not assigned to any class.');
    });
    (0, node_test_1.default)('updateClass() - success', async () => {
        const createClassNameResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createClassNameResponse2 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className2);
        node_assert_1.default.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse1 = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSchoolYearResponse2 = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear2);
        node_assert_1.default.strictEqual(createSchoolYearResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse1.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            classNameId: createClassNameResponse2.body.data.id,
            schoolYearId: createSchoolYearResponse2.body.data.id,
            teacherId: signUpResponse.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        node_assert_1.default.strictEqual(updateClassResponse.body.data.class_name_id, createClassNameResponse2.body.data.id, 'Expected the updated class name ID to match the created class name ID.');
        node_assert_1.default.strictEqual(updateClassResponse.body.data.school_year_id, createSchoolYearResponse2.body.data.id, 'Expected the updated school year ID to match the created school year ID.');
        node_assert_1.default.strictEqual(updateClassResponse.body.data.teacher_id, signUpResponse.body.data, 'Expected the updated teacher ID to match the created teacher ID.');
    });
    (0, node_test_1.default)('updateClass() - validation error', async () => {
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${testData_1.invalidIdUrl}`, {
            classNameId: testData_1.emptyString,
            schoolYearId: testData_1.emptyString,
            teacherId: testData_1.emptyString,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateClassResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateClass() - class does not exist', async () => {
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${testData_1.nonExistentId}`, {
            classNameId: testData_1.nonExistentId,
            schoolYearId: testData_1.nonExistentId,
            teacherId: testData_1.nonExistentId,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('updateClass() - class name does not exist', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            classNameId: testData_1.nonExistentId,
            schoolYearId: testData_1.nonExistentId,
            teacherId: testData_1.nonExistentId,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class name that does not exist.');
    });
    (0, node_test_1.default)('updateClass() - school year does not exist', async () => {
        const createClassNameResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createClassNameResponse2 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className2);
        node_assert_1.default.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            classNameId: createClassNameResponse2.body.data.id,
            schoolYearId: testData_1.nonExistentId,
            teacherId: testData_1.nonExistentId,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });
    (0, node_test_1.default)('updateClass() - teacher does not exist', async () => {
        const createClassNameResponse1 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createClassNameResponse2 = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className2);
        node_assert_1.default.strictEqual(createClassNameResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse1 = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSchoolYearResponse2 = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear2);
        node_assert_1.default.strictEqual(createSchoolYearResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse1.body.data.id,
            schoolYearId: createSchoolYearResponse1.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            classNameId: createClassNameResponse2.body.data.id,
            schoolYearId: createSchoolYearResponse2.body.data.id,
            teacherId: testData_1.nonExistentId,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });
    (0, node_test_1.default)('assignStudent() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const assignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        node_assert_1.default.strictEqual(assignStudentResponse.body.data.class_id, createClassResponse.body.data.id, 'Expected the assigned student to be in the correct class.');
    });
    (0, node_test_1.default)('assignStudent() - validation error', async () => {
        const assignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${testData_1.invalidIdUrl}`, { studentId: testData_1.emptyString });
        node_assert_1.default.strictEqual(assignStudentResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(assignStudentResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('assignStudent() - class does not exist', async () => {
        const assignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${testData_1.nonExistentId}`, { studentId: testData_1.nonExistentId });
        node_assert_1.default.strictEqual(assignStudentResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('assignStudent() - student does not exist', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const assignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: testData_1.nonExistentId });
        node_assert_1.default.strictEqual(assignStudentResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('unassignStudent() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const assignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const unassignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/unassign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse.body.data });
        node_assert_1.default.strictEqual(unassignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student unassignment.');
        node_assert_1.default.strictEqual(unassignStudentResponse.body.data.class_id, null, 'Expected class ID to be a null.');
    });
    (0, node_test_1.default)('unassignStudent() - validation error', async () => {
        const unassignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/unassign-student/${testData_1.invalidIdUrl}`, { studentId: testData_1.emptyString });
        node_assert_1.default.strictEqual(unassignStudentResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(unassignStudentResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('unassignStudent() - class does not exist', async () => {
        const unassignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/unassign-student/${testData_1.nonExistentId}`, { studentId: testData_1.nonExistentId });
        node_assert_1.default.strictEqual(unassignStudentResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('unassignStudent() - student does not exist', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const unassignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/unassign-student/${createClassResponse.body.data.id}`, { studentId: testData_1.nonExistentId });
        node_assert_1.default.strictEqual(unassignStudentResponse.statusCode, 404, 'Expected the status code to be 200 for a student that does not exist.');
    });
    (0, node_test_1.default)('deleteClass() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const deleteClassResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/class/${createClassResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class deletion.');
        node_assert_1.default.strictEqual(deleteClassResponse.body.data.id, createClassResponse.body.data.id, 'Expected the deleted class ID to match the created class ID.');
    });
    (0, node_test_1.default)('deleteClass() - validation error', async () => {
        const deleteClassResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/class/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteClassResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteClass() - class does not exist', async () => {
        const deleteClassResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/class/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteClassResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
});
