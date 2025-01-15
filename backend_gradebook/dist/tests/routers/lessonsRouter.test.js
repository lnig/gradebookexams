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
(0, node_test_1.suite)('lessonsRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.students_parents.deleteMany();
        await db_1.default.students.deleteMany();
        await db_1.default.lessons.deleteMany();
        await db_1.default.classes.deleteMany();
        await db_1.default.teachers.deleteMany();
        await db_1.default.subjects.deleteMany();
        await db_1.default.class_names.deleteMany();
        await db_1.default.semesters.deleteMany();
        await db_1.default.school_years.deleteMany();
    });
    (0, node_test_1.default)('createLessons() - success', async () => {
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
    });
    (0, node_test_1.default)('createLessons() - validation error', async () => {
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            startDate: testData_1.emptyString,
            endDate: testData_1.emptyString,
            teacherId: testData_1.emptyString,
            classId: testData_1.emptyString,
            subjectId: testData_1.emptyString,
            lessonSchedules: [
                {
                    dayOfWeek: 7,
                    startTime: testData_1.emptyString,
                    endTime: testData_1.emptyString,
                    frequency: 0
                }
            ],
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.errors.length, 9, 'Expected the number of validation errors to be 9.');
    });
    (0, node_test_1.default)('createLessons() - teacher does not exist', async () => {
        const generateLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: testData_1.nonExistentId,
            classId: testData_1.nonExistentId,
            subjectId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a teacher that does not exist.');
    });
    (0, node_test_1.default)('createLessons() - class does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const generateLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse.body.data,
            classId: testData_1.nonExistentId,
            subjectId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(generateLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('createLessons() - subject does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
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
            teacherId: signUpResponse.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
    (0, node_test_1.default)('createLessons() - lessons overlap', async () => {
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
            teacherId: signUpResponse.body.data
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createLessonsResponse1 = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        const createLessonsResponse2 = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse2.statusCode, 409, 'Expected the status code to be 409 for lessons that overlap.');
    });
    (0, node_test_1.default)('createLessons() - start date is not earlier than end date', async () => {
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
        const createLessonsResponse1 = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...{
                startDate: '2023-12-21',
                endDate: '2023-12-15',
                lessonSchedules: [
                    {
                        dayOfWeek: 2,
                        startTime: '12:00',
                        endTime: '13:00',
                        frequency: 1
                    }, {
                        dayOfWeek: 5,
                        startTime: '15:00',
                        endTime: '16:00',
                        frequency: 2
                    }
                ],
            },
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse1.statusCode, 400, 'Expected the status code to be 400 for a start date that is before an end date.');
    });
    (0, node_test_1.default)('getLessons() - success', async () => {
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
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
    });
    (0, node_test_1.default)('getLessons() - validation error', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${testData_1.invalidIdUrl}/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('getLessons() - class does not exist', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${testData_1.nonExistentId}/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('getLessons() - subject does not exist', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
    (0, node_test_1.default)('getAllLessons() - success', async () => {
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
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
    });
    (0, node_test_1.default)('GetLessonsByClassId() - success', async () => {
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
        const createLessonsResponse1 = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/class/${createClassResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
    });
    (0, node_test_1.default)('GetLessonsByClassId() - validation error', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/class/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('GetLessonsByClassId() - class does not exist', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/class/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('GetLessonsForUser() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
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
            teacherId: signUpResponse.body.data,
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const assignStudentResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse2.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const createLessonsResponse1 = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData2,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/user/${signUpResponse2.body.data}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');
    });
    (0, node_test_1.default)('GetLessonsForUser() - validation error', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/user/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('GetLessonsForUser() - user does not exist', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/user/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });
    (0, node_test_1.default)('GetLessonsForUser() - user does not exist', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/user/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });
    (0, node_test_1.default)('GetLessonsThreeDaysBack() - success', async () => {
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
            ...testData_1.lessonsData3,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/back/${signUpResponse2.body.data}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons three days back retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 1, 'Expected the number of retrieved lessons to be 1.');
    });
    (0, node_test_1.default)('GetLessonsThreeDaysBack() - validation error', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/back/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('GetLessonsThreeDaysBack() - user does not exist', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/back/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });
    (0, node_test_1.default)('getLessonsThreeDaysAhead() - success', async () => {
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
        const createLessonsResponse1 = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData2,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/ahead/${signUpResponse2.body.data}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons three days ahead retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');
    });
    (0, node_test_1.default)('getLessonsThreeDaysAhead() - validation error', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/ahead/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getLessonsThreeDaysAhead() - user does not exist', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/ahead/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });
    (0, node_test_1.default)('getLessonsToday() - success', async () => {
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
            ...testData_1.lessonsData2,
            teacherId: updateClassResponse.body.data.teacher_id,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/today/${signUpResponse2.body.data}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons today retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 1, 'Expected the number of retrieved lessons to be 1.');
    });
    (0, node_test_1.default)('getLessonsToday() - validation error', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/today/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getLessonsToday() - user does not exist', async () => {
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/today/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a user that does not exist.');
    });
    (0, node_test_1.default)('updateLesson() - success', async () => {
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
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const updateLessonResponse = await (0, requestHelpers_1.sendPatchRequest)(`/lesson/${lesson.id}`, {
            description: testData_1.newDescription
        });
        node_assert_1.default.strictEqual(updateLessonResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lesson update.');
        node_assert_1.default.strictEqual(updateLessonResponse.body.data.description, testData_1.newDescription, `Expected the updated lesson description to be "${testData_1.newDescription}".`);
    });
    (0, node_test_1.default)('updateLesson() - validation error', async () => {
        const updateLessonResponse = await (0, requestHelpers_1.sendPatchRequest)(`/lesson/${testData_1.invalidIdUrl}`, {
            description: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateLessonResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateLessonResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateLesson() - lesson does not exist', async () => {
        const updateLessonResponse = await (0, requestHelpers_1.sendPatchRequest)(`/lesson/${testData_1.nonExistentId}`, {
            description: testData_1.newDescription
        });
        node_assert_1.default.strictEqual(updateLessonResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });
    (0, node_test_1.default)('deleteLessonsByClassAndSubjectIds() - success', async () => {
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
        const deleteLessonsResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/class/${createClassResponse.body.data.id}/subject/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons deletion.');
        node_assert_1.default.strictEqual(deleteLessonsResponse.body.data, 6, 'Expected the number of deleted lessons to be 6.');
    });
    (0, node_test_1.default)('deleteLessonsByClassAndSubjectIds() - validation error', async () => {
        const deleteLessonsResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/class/${testData_1.invalidIdUrl}/subject/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('deleteLessonsByClassAndSubjectIds() - class does not exist', async () => {
        const deleteLessonsResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/class/${testData_1.nonExistentId}/subject/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('deleteLessonsByClassAndSubjectIds() - subject does not exist', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const deleteLessonsResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/class/${createClassResponse.body.data.id}/subject/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a subject that does not exist.');
    });
    (0, node_test_1.default)('deleteLessonsByClassIdAndDate() - success', async () => {
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
        const deleteLessonsResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/class/${createClassResponse.body.data.id}/date/2024-10-04`);
        node_assert_1.default.strictEqual(deleteLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons deletion.');
        node_assert_1.default.strictEqual(deleteLessonsResponse.body.data, 1, 'Expected the number of deleted lessons to be 1.');
    });
    (0, node_test_1.default)('deleteLessonsByClassIdAndDate() - validation error', async () => {
        const deleteLessonsResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/class/${testData_1.invalidIdUrl}/date/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteLessonsResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteLessonsResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('deleteLessonsByClassIdAndDate() - class does not exist', async () => {
        const deleteLessonsResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/class/${testData_1.nonExistentId}/date/2024-10-04`);
        node_assert_1.default.strictEqual(deleteLessonsResponse.statusCode, 404, 'Expected the status code to be 404 for a class that does not exist.');
    });
    (0, node_test_1.default)('deleteLesson() - success', async () => {
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
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/user/${signUpResponse.body.data}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson = getLessonsResponse.body.data[0];
        const deleteLessonResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/${lesson.id}`);
        node_assert_1.default.strictEqual(deleteLessonResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lesson deletion.');
        node_assert_1.default.strictEqual(deleteLessonResponse.body.data.id, lesson.id, 'Expected the deleted lesson Id to match the created lesson Id.');
    });
    (0, node_test_1.default)('deleteLesson() - validation error', async () => {
        const deleteLessonResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteLessonResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteLessonResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteLesson() - lesson does not exist', async () => {
        const deleteLessonResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/lesson/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteLessonResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });
});
