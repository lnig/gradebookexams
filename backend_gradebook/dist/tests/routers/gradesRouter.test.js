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
(0, node_test_1.suite)('gradesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.grades_gradebook.deleteMany();
        await db_1.default.final_grades.deleteMany();
        await db_1.default.semesters.deleteMany();
        await db_1.default.school_years.deleteMany();
        await db_1.default.students.deleteMany();
        await db_1.default.teachers.deleteMany();
        await db_1.default.subjects.deleteMany();
    });
    (0, node_test_1.default)('createGrade() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        node_assert_1.default.strictEqual(createGradeResponse.body.data.description, testData_1.grade1.description, `Expected the description to be "${testData_1.grade1.description}".`);
        node_assert_1.default.strictEqual(createGradeResponse.body.data.grade, testData_1.grade1.grade, `Expected the grade to be "${testData_1.grade1.grade}".`);
        node_assert_1.default.strictEqual(createGradeResponse.body.data.weight, testData_1.grade1.weight, `Expected the weight to be "${testData_1.grade1.weight}".`);
        node_assert_1.default.strictEqual(createGradeResponse.body.data.student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        node_assert_1.default.strictEqual(createGradeResponse.body.data.subject_id, createSubjectResponse.body.data.id, 'Expected the subject ID to match the created subject ID.');
        node_assert_1.default.strictEqual(createGradeResponse.body.data.teacher_id, signUpResponse2.body.data, 'Expected the teacher ID to match the created teacher ID.');
    });
    (0, node_test_1.default)('createGrade() - validation error', async () => {
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            description: testData_1.emptyString,
            grade: 0,
            weight: 0,
            studentId: testData_1.emptyString,
            subjectId: testData_1.emptyString,
            teacherId: testData_1.emptyString,
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createGradeResponse.body.errors.length, 6, 'Expected the number of validation errors to be 6.');
    });
    (0, node_test_1.default)('createGrade() - student does not exist', async () => {
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade1,
            studentId: testData_1.nonExistentId,
            subjectId: testData_1.nonExistentId,
            teacherId: testData_1.nonExistentId,
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('createGrade() - subject does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade1,
            studentId: signUpResponse.body.data,
            subjectId: testData_1.nonExistentId,
            teacherId: testData_1.nonExistentId,
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
    (0, node_test_1.default)('createGrade() - teacher does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade1,
            studentId: signUpResponse.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: testData_1.nonExistentId,
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a teacher that does not exist.');
    });
    (0, node_test_1.default)('createFinalGrade() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        node_assert_1.default.strictEqual(createGradeResponse.body.data.grade, testData_1.finalGrade1.grade, `Expected the grade to be "${testData_1.grade1.grade}".`);
        node_assert_1.default.strictEqual(createGradeResponse.body.data.student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        node_assert_1.default.strictEqual(createGradeResponse.body.data.subject_id, createSubjectResponse.body.data.id, 'Expected the subject ID to match the created subject ID.');
        node_assert_1.default.strictEqual(createGradeResponse.body.data.teacher_id, signUpResponse2.body.data, 'Expected the teacher ID to match the created teacher ID.');
        node_assert_1.default.strictEqual(createGradeResponse.body.data.semester_id, createSemesterResponse.body.data.id, 'Expected the semester ID to match the created semester ID.');
    });
    (0, node_test_1.default)('createFinalGrade() - validation error', async () => {
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            grade: 0,
            studentId: testData_1.emptyString,
            subjectId: testData_1.emptyString,
            teacherId: testData_1.emptyString,
            semesterId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createGradeResponse.body.errors.length, 5, 'Expected the number of validation errors to be 5.');
    });
    (0, node_test_1.default)('createFinalGrade() - student does not exist', async () => {
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade1,
            studentId: testData_1.nonExistentId,
            subjectId: testData_1.nonExistentId,
            teacherId: testData_1.nonExistentId,
            semesterId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('createFinalGrade() - subject does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade1,
            studentId: signUpResponse.body.data,
            subjectId: testData_1.nonExistentId,
            teacherId: testData_1.nonExistentId,
            semesterId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
    (0, node_test_1.default)('createFinalGrade() - teacher does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade1,
            studentId: signUpResponse.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: testData_1.nonExistentId,
            semesterId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a teacher that does not exist.');
    });
    (0, node_test_1.default)('createFinalGrade() - semester does not exist', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
            semesterId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a semester that does not exist.');
    });
    (0, node_test_1.default)('getGrades() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createGradeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
        });
        node_assert_1.default.strictEqual(createGradeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const createGradeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade2,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
        });
        node_assert_1.default.strictEqual(createGradeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/${signUpResponse1.body.data}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grades retrieval.');
        node_assert_1.default.strictEqual(getGradesResponse.body.data.length, 2, 'Expected the number of retrieved grades to be 2.');
    });
    (0, node_test_1.default)('getGrades() - validation error', async () => {
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/${testData_1.invalidIdUrl}/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getGradesResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('getGrades() - student does not exist', async () => {
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/${testData_1.nonExistentId}/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('getGrades() - subject does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/${signUpResponse.body.data}/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
    (0, node_test_1.default)('getFinalGrades() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse1 = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSubjectResponse2 = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject2);
        node_assert_1.default.strictEqual(createSubjectResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createGradeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse1.body.data.id,
            teacherId: signUpResponse2.body.data,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createGradeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const createGradeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade2,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse2.body.data.id,
            teacherId: signUpResponse2.body.data,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createGradeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/final/${signUpResponse1.body.data}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grades retrieval.');
        node_assert_1.default.strictEqual(getGradesResponse.body.data.length, 2, 'Expected the number of retrieved grades to be 2.');
    });
    (0, node_test_1.default)('getFinalGrades() - validation error', async () => {
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/final/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getGradesResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getFinalGrades() - student does not exist', async () => {
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/final/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('getThreeLatestGrades() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createGradeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
        });
        node_assert_1.default.strictEqual(createGradeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const createGradeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade2,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
        });
        node_assert_1.default.strictEqual(createGradeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/latest/${signUpResponse1.body.data}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful three latest grades retrieval.');
        node_assert_1.default.strictEqual(getGradesResponse.body.data.length, 2, 'Expected the number of retrieved grades to be 2.');
    });
    (0, node_test_1.default)('getThreeLatestGrades() - validation error', async () => {
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/latest/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getGradesResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getThreeLatestGrades() - student does not exist', async () => {
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/grade/latest/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('updateGrade() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const updateGradeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/grade/${createGradeResponse.body.data.id}`, {
            description: testData_1.grade2.description,
            grade: testData_1.grade2.grade,
            weight: testData_1.grade2.weight
        });
        node_assert_1.default.strictEqual(updateGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade update.');
        node_assert_1.default.strictEqual(updateGradeResponse.body.data.description, testData_1.grade2.description, `Expected the updated description to be "${testData_1.grade2.description}".`);
        node_assert_1.default.strictEqual(updateGradeResponse.body.data.grade, testData_1.grade2.grade, `Expected the updated grade to be "${testData_1.grade2.grade}".`);
        node_assert_1.default.strictEqual(updateGradeResponse.body.data.weight, testData_1.grade2.weight, `Expected the updated weight to be "${testData_1.grade2.weight}".`);
    });
    (0, node_test_1.default)('updateGrade() - validation error', async () => {
        const updateGradeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/grade/${testData_1.invalidIdUrl}`, {
            description: testData_1.emptyString,
            grade: 0,
            weight: 0
        });
        node_assert_1.default.strictEqual(updateGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateGradeResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateGrade() - grade does not exist', async () => {
        const updateGradeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/grade/${testData_1.nonExistentId}`, {
            description: testData_1.grade2.description,
            grade: testData_1.grade2.grade,
            weight: testData_1.grade2.weight
        });
        node_assert_1.default.strictEqual(updateGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a grade that does not exist.');
    });
    (0, node_test_1.default)('updateFinalGrade() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const updateGradeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/grade/final/${createGradeResponse.body.data.id}`, {
            grade: testData_1.finalGrade2.grade
        });
        node_assert_1.default.strictEqual(updateGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade update.');
        node_assert_1.default.strictEqual(updateGradeResponse.body.data.grade, testData_1.finalGrade2.grade, `Expected the updated grade to be "${testData_1.finalGrade2.grade}".`);
    });
    (0, node_test_1.default)('updateFinalGrade() - validation error', async () => {
        const updateGradeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/grade/final/${testData_1.invalidIdUrl}`, {
            grade: 0
        });
        node_assert_1.default.strictEqual(updateGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateGradeResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateFinalGrade() - grade does not exist', async () => {
        const updateGradeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/grade/final/${testData_1.nonExistentId}`, {
            grade: testData_1.grade2.grade
        });
        node_assert_1.default.strictEqual(updateGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a grade that does not exist.');
    });
    (0, node_test_1.default)('deleteGrade() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade', {
            ...testData_1.grade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const deleteGradeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/grade/${createGradeResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade deletion.');
        node_assert_1.default.strictEqual(deleteGradeResponse.body.data.id, createGradeResponse.body.data.id, 'Expected the deleted grade ID to match the created grade ID.');
    });
    (0, node_test_1.default)('deleteGrade() - validation error', async () => {
        const deleteGradeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/grade/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteGradeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteGrade() - grade does not exist', async () => {
        const deleteGradeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/grade/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a grade that does not exist.');
    });
    (0, node_test_1.default)('deleteFinalGrade() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/grade/final', {
            ...testData_1.finalGrade1,
            studentId: signUpResponse1.body.data,
            subjectId: createSubjectResponse.body.data.id,
            teacherId: signUpResponse2.body.data,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade creation.');
        const deleteGradeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/grade/final/${createGradeResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteGradeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful grade deletion.');
        node_assert_1.default.strictEqual(deleteGradeResponse.body.data.id, createGradeResponse.body.data.id, 'Expected the deleted grade ID to match the created grade ID.');
    });
    (0, node_test_1.default)('deleteFinalGrade() - validation error', async () => {
        const deleteGradeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/grade/final/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteGradeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteFinalGrade() - grade does not exist', async () => {
        const deleteGradeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/grade/final/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteGradeResponse.statusCode, 404, 'Expected the status code to be 404 for a grade that does not exist.');
    });
});
