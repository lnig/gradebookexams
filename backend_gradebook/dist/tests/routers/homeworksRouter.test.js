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
(0, node_test_1.suite)('homeworksRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.homeworks.deleteMany();
        await db_1.default.students.deleteMany();
        await db_1.default.lessons.deleteMany();
        await db_1.default.classes.deleteMany();
        await db_1.default.teachers.deleteMany();
        await db_1.default.subjects.deleteMany();
        await db_1.default.semesters.deleteMany();
        await db_1.default.class_names.deleteMany();
        await db_1.default.school_years.deleteMany();
    });
    (0, node_test_1.default)('createHomework() - success', async () => {
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
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createHomeworkResponse = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            ...testData_1.homework1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');
        node_assert_1.default.strictEqual(createHomeworkResponse.body.data.description, testData_1.homework1.description, `Expected the description to be "${testData_1.homework1.description}".`);
        node_assert_1.default.strictEqual(createHomeworkResponse.body.data.deadline, new Date(testData_1.homework1.deadline).toISOString(), `Expected the deadline to be "${testData_1.homework1.deadline}".`);
        node_assert_1.default.strictEqual(createHomeworkResponse.body.data.lesson_id, lesson.id, 'Expected the lesson ID to match the created lesson ID.');
    });
    (0, node_test_1.default)('createHomework() - validation error', async () => {
        const createHomeworkResponse = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            description: testData_1.emptyString,
            deadline: testData_1.emptyString,
            lessonId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createHomeworkResponse.body.errors.length, 3, 'Expected the number of validation errors to be 3.');
    });
    (0, node_test_1.default)('createHomework() - lesson does not exist', async () => {
        const createHomeworkResponse = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            description: testData_1.homework1.description,
            deadline: testData_1.homework1.deadline,
            lessonId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });
    (0, node_test_1.default)('createHomework() - homework already exists', async () => {
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
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createHomeworkResponse1 = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            ...testData_1.homework1,
            lessonId: lesson.id,
            teacherId: signUpResponse.body.data
        });
        node_assert_1.default.strictEqual(createHomeworkResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');
        const createHomeworkResponse2 = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            ...testData_1.homework2,
            lessonId: lesson.id,
            teacherId: signUpResponse.body.data
        });
        node_assert_1.default.strictEqual(createHomeworkResponse2.statusCode, 409, 'Expected the status code to be 409 for homework that already exists.');
    });
    (0, node_test_1.default)('getHomework() - success', async () => {
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
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createHomeworkResponse = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            ...testData_1.homework1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');
        const getHomeworkResponse = await (0, requestHelpers_1.sendGetRequest)(`/homework/${lesson.id}`);
        node_assert_1.default.strictEqual(getHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework retrieval.');
        node_assert_1.default.strictEqual(getHomeworkResponse.body.data.description, testData_1.homework1.description, `Expected the description to be "${testData_1.homework1.description}".`);
        node_assert_1.default.strictEqual(getHomeworkResponse.body.data.deadline, new Date(testData_1.homework1.deadline).toISOString(), `Expected the deadline to be "${testData_1.homework1.deadline}".`);
        node_assert_1.default.strictEqual(getHomeworkResponse.body.data.lesson_id, lesson.id, 'Expected the lesson ID to match the created lesson ID.');
    });
    (0, node_test_1.default)('getHomework() - validation error', async () => {
        const getHomeworkResponse = await (0, requestHelpers_1.sendGetRequest)(`/homework/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getHomeworkResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getHomework() - lesson does not exist', async () => {
        const getHomeworkResponse = await (0, requestHelpers_1.sendGetRequest)(`/homework/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('getLatestHomework() - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
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
            teacherId: signUpResponse1.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const assignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse2.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createHomeworkResponse = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            ...testData_1.homework1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');
        const getLatestHomeworkResponse = await (0, requestHelpers_1.sendGetRequest)(`/homework/latest/${signUpResponse2.body.data}`);
        node_assert_1.default.strictEqual(getLatestHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful latest homework retrieval.');
        node_assert_1.default.strictEqual(getLatestHomeworkResponse.body.data.description, testData_1.homework1.description, `Expected the description to be "${testData_1.homework1.description}".`);
        node_assert_1.default.strictEqual(getLatestHomeworkResponse.body.data.deadline, new Date(testData_1.homework1.deadline).toISOString(), `Expected the deadline to be "${testData_1.homework1.deadline}".`);
        node_assert_1.default.strictEqual(getLatestHomeworkResponse.body.data.lesson_id, lesson.id, 'Expected the lesson ID to match the created lesson ID.');
    });
    (0, node_test_1.default)('getLatestHomework() - validation error', async () => {
        const getLatestHomeworkResponse = await (0, requestHelpers_1.sendGetRequest)(`/homework/latest/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getLatestHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getLatestHomeworkResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getLatestHomework() - student does not exist', async () => {
        const getLatestHomeworkResponse = await (0, requestHelpers_1.sendGetRequest)(`/homework/latest/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLatestHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('getLatestHomework() - student is not assigned to any class', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const getLatestHomeworkResponse = await (0, requestHelpers_1.sendGetRequest)(`/homework/latest/${signUpResponse.body.data}`);
        node_assert_1.default.strictEqual(getLatestHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a student that is not assigned to any class.');
    });
    (0, node_test_1.default)('updateHomework() - success', async () => {
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
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createHomeworkResponse = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            ...testData_1.homework1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');
        const updateHomeworkResponse = await (0, requestHelpers_1.sendPatchRequest)(`/homework/${createHomeworkResponse.body.data.id}`, {
            description: testData_1.homework2.description,
            deadline: testData_1.homework2.deadline
        });
        node_assert_1.default.strictEqual(updateHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework update.');
        node_assert_1.default.strictEqual(updateHomeworkResponse.body.data.description, testData_1.homework2.description, `Expected the updated description to be "${testData_1.homework2.description}".`);
        node_assert_1.default.strictEqual(updateHomeworkResponse.body.data.deadline, new Date(testData_1.homework2.deadline).toISOString(), `Expected the updated deadline to be "${testData_1.homework2.deadline}".`);
    });
    (0, node_test_1.default)('updateHomework() - validation error', async () => {
        const updateHomeworkResponse = await (0, requestHelpers_1.sendPatchRequest)(`/homework/${testData_1.invalidIdUrl}`, {
            description: testData_1.emptyString,
            deadline: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateHomeworkResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateHomework() - homework does not exist', async () => {
        const updateHomeworkResponse = await (0, requestHelpers_1.sendPatchRequest)(`/homework/${testData_1.nonExistentId}`, {
            description: testData_1.homework2.description,
            deadline: testData_1.homework2.deadline
        });
        node_assert_1.default.strictEqual(updateHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a homework that does not exist.');
    });
    (0, node_test_1.default)('deleteHomework() - success', async () => {
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
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const createHomeworkResponse = await (0, requestHelpers_1.sendPostRequest)('/homework', {
            ...testData_1.homework1,
            lessonId: lesson.id
        });
        node_assert_1.default.strictEqual(createHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework creation.');
        const deleteHomeworkResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/homework/${createHomeworkResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteHomeworkResponse.statusCode, 200, 'Expected the status code to be 200 for a successful homework deletion.');
        node_assert_1.default.strictEqual(deleteHomeworkResponse.body.data.id, createHomeworkResponse.body.data.id, 'Expected the deleted homework ID to match the created homework ID.');
    });
    (0, node_test_1.default)('deleteHomework() - validation error', async () => {
        const deleteHomeworkResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/homework/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteHomeworkResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteHomeworkResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteHomework() - homework does not exist', async () => {
        const deleteHomeworkResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/homework/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteHomeworkResponse.statusCode, 404, 'Expected the status code to be 404 for a homework that does not exist.');
    });
});
