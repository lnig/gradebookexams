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
(0, node_test_1.suite)('examsRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.gradebook_exams.deleteMany();
        await db_1.default.lessons.deleteMany();
        await db_1.default.classes.deleteMany();
        await db_1.default.teachers.deleteMany();
        await db_1.default.subjects.deleteMany();
        await db_1.default.class_names.deleteMany();
        await db_1.default.semesters.deleteMany();
        await db_1.default.school_years.deleteMany();
    });
    (0, node_test_1.default)('createExam() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            teacherId: signUpResponse.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createExamResponse = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        node_assert_1.default.strictEqual(createExamResponse.body.data.topic, testData_1.exam1.topic, `Expected the topic to be "${testData_1.exam1.topic}".`);
        node_assert_1.default.strictEqual(createExamResponse.body.data.scope, testData_1.exam1.scope, `Expected the scope to be "${testData_1.exam1.scope}".`);
        node_assert_1.default.strictEqual(createExamResponse.body.data.lesson_id, lesson.id, 'Expected the lesson ID to match the created lesson ID.');
    });
    (0, node_test_1.default)('createExam() - validation error', async () => {
        const createExamResponse = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            topic: testData_1.emptyString,
            scope: testData_1.emptyString,
            lessonId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createExamResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createExamResponse.body.errors.length, 3, 'Expected the number of validation errors to be 3.');
    });
    (0, node_test_1.default)('createExam() - lesson does not exist', async () => {
        const createExamResponse = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam1,
            lessonId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createExamResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });
    (0, node_test_1.default)('getExams() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            teacherId: signUpResponse.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createExamResponse1 = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createExamResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        const createExamResponse2 = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createExamResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        const getExamsResponse = await (0, requestHelpers_1.sendGetRequest)(`/exam/${signUpResponse.body.data}`);
        node_assert_1.default.strictEqual(getExamsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exams retrieval.');
        node_assert_1.default.strictEqual(getExamsResponse.body.data.length, 2, 'Expected the number of retrieved exams to be 2.');
    });
    (0, node_test_1.default)('getExams() - validation error', async () => {
        const getExamsResponse = await (0, requestHelpers_1.sendGetRequest)(`/exam/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getExamsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getExamsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getExams() - user does not exist', async () => {
        const getExamsResponse = await (0, requestHelpers_1.sendGetRequest)(`/exam/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getExamsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });
    (0, node_test_1.default)('getThreeUpcomingExams() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            teacherId: signUpResponse.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData4,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson1 = getLessonsResponse.body.data[1];
        const lesson2 = getLessonsResponse.body.data[2];
        const lesson3 = getLessonsResponse.body.data[4];
        const lesson4 = getLessonsResponse.body.data[5];
        const createExamResponse1 = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam1,
            lessonId: lesson1.id
        });
        node_assert_1.default.strictEqual(createExamResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        const createExamResponse2 = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam2,
            lessonId: lesson2.id
        });
        node_assert_1.default.strictEqual(createExamResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        const createExamResponse3 = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam3,
            lessonId: lesson3.id
        });
        node_assert_1.default.strictEqual(createExamResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        const createExamResponse4 = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam4,
            lessonId: lesson4.id
        });
        node_assert_1.default.strictEqual(createExamResponse4.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        const getExamsResponse = await (0, requestHelpers_1.sendGetRequest)(`/exam/upcoming/${signUpResponse.body.data}`);
        node_assert_1.default.strictEqual(getExamsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exams retrieval.');
        node_assert_1.default.strictEqual(getExamsResponse.body.data.length, 3, 'Expected the number of retrieved exams to be 3.');
        node_assert_1.default.strictEqual(getExamsResponse.body.data[0].id, createExamResponse1.body.data.id, 'Expected the retrieved exam ID to match the created exam ID.');
        node_assert_1.default.strictEqual(getExamsResponse.body.data[1].id, createExamResponse3.body.data.id, 'Expected the retrieved exam ID to match the created exam ID.');
        node_assert_1.default.strictEqual(getExamsResponse.body.data[2].id, createExamResponse2.body.data.id, 'Expected the retrieved exam ID to match the created exam ID.');
    });
    (0, node_test_1.default)('getThreeUpcomingExams() - validation error', async () => {
        const getExamsResponse = await (0, requestHelpers_1.sendGetRequest)(`/exam/upcoming/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getExamsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getExamsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getThreeUpcomingExams() - user does not exist', async () => {
        const getExamsResponse = await (0, requestHelpers_1.sendGetRequest)(`/exam/upcoming/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getExamsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });
    (0, node_test_1.default)('updateGrade() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            teacherId: signUpResponse.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createExamResponse = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        const updateExamResponse = await (0, requestHelpers_1.sendPatchRequest)(`/exam/${createExamResponse.body.data.id}`, {
            topic: testData_1.exam2.topic,
            scope: testData_1.exam2.scope
        });
        node_assert_1.default.strictEqual(updateExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam update.');
        node_assert_1.default.strictEqual(updateExamResponse.body.data.topic, testData_1.exam2.topic, `Expected the updated topic to be "${testData_1.exam2.topic}".`);
        node_assert_1.default.strictEqual(updateExamResponse.body.data.scope, testData_1.exam2.scope, `Expected the updated scope to be "${testData_1.exam2.scope}".`);
    });
    (0, node_test_1.default)('updateExam() - validation error', async () => {
        const updateExamResponse = await (0, requestHelpers_1.sendPatchRequest)(`/exam/${testData_1.invalidIdUrl}`, {
            topic: testData_1.emptyString,
            scope: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateExamResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateExamResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateExam() - exam does not exist', async () => {
        const updateExamResponse = await (0, requestHelpers_1.sendPatchRequest)(`/exam/${testData_1.nonExistentId}`, {
            topic: testData_1.exam2.topic,
            scope: testData_1.exam2.scope
        });
        node_assert_1.default.strictEqual(updateExamResponse.statusCode, 404, 'Expected the status code to be 404 for an exam that does not exist.');
    });
    (0, node_test_1.default)('deleteExam() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, {
            teacherId: signUpResponse.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createExamResponse = await (0, requestHelpers_1.sendPostRequest)('/exam', {
            ...testData_1.exam1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam creation.');
        const deleteExamResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/exam/${createExamResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteExamResponse.statusCode, 200, 'Expected the status code to be 200 for a successful exam deletion.');
        node_assert_1.default.strictEqual(deleteExamResponse.body.data.id, createExamResponse.body.data.id, 'Expected the deleted exam ID to match the created exam ID.');
    });
    (0, node_test_1.default)('deleteExam() - validation error', async () => {
        const deleteExamResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/exam/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteExamResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteExamResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteExam() - exam does not exist', async () => {
        const deleteExamResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/exam/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteExamResponse.statusCode, 404, 'Expected the status code to be 404 for an exam that does not exist.');
    });
});
