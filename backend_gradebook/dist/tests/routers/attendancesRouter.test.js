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
(0, node_test_1.suite)('attendancesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.attendances.deleteMany();
        await db_1.default.lessons.deleteMany();
        await db_1.default.students.deleteMany();
        await db_1.default.classes.deleteMany();
        await db_1.default.teachers.deleteMany();
        await db_1.default.subjects.deleteMany();
        await db_1.default.class_names.deleteMany();
        await db_1.default.semesters.deleteMany();
        await db_1.default.school_years.deleteMany();
    });
    (0, node_test_1.default)('createAttendances() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
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
        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        node_assert_1.default.strictEqual(createAttendancesResponse.body.data, 2, `Expected the number of created attendances to be 2.`);
    });
    (0, node_test_1.default)('createAttendances() - validation error (attendances is not an empty array)', async () => {
        const attendancesData = {
            lessonId: testData_1.emptyString,
            attendances: [
                {
                    wasPresent: testData_1.emptyString,
                    wasLate: testData_1.emptyString,
                    wasExcused: testData_1.emptyString,
                    studentId: testData_1.emptyString
                }
            ]
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createAttendancesResponse.body.errors.length, 5, 'Expected the number of validation errors to be 5.');
    });
    (0, node_test_1.default)('createAttendances() - validation error (attendances is an empty array)', async () => {
        const attendancesData = {
            lessonId: testData_1.emptyString,
            attendances: []
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createAttendancesResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('createAttendances() - absent and simultaneously late', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
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
        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: false,
                    wasLate: true,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: false,
                    wasLate: true,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was absent and late at the same time.');
    });
    (0, node_test_1.default)('createAttendances() - present, not late and simultaneously excused', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
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
        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: true,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: false,
                    wasLate: true,
                    wasExcused: true,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was present, not late and excused at the same time.');
    });
    (0, node_test_1.default)('createAttendances() - lesson does not exist', async () => {
        const attendancesData = {
            lessonId: testData_1.nonExistentId,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: testData_1.nonExistentId
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: testData_1.nonExistentId
                }
            ]
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });
    (0, node_test_1.default)('createAttendances() - student does not exist', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
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
        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: testData_1.nonExistentId
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: testData_1.nonExistentId
                }
            ]
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 404, 'Expected the status code to be 404 for a student does not exist.');
    });
    (0, node_test_1.default)('createAttendances() - attendances already exist', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
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
        const attendancesData1 = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                }
            ]
        };
        const createAttendancesResponse1 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData1);
        node_assert_1.default.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const attendancesData2 = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse2 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData2);
        node_assert_1.default.strictEqual(createAttendancesResponse2.statusCode, 409, 'Expected the status code to be 200 for attendances that already exist.');
    });
    (0, node_test_1.default)('getLessonAttendances() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
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
        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const getAttendancesResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/${lesson.id}`);
        node_assert_1.default.strictEqual(getAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        node_assert_1.default.strictEqual(getAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved attendances to be 2.');
    });
    (0, node_test_1.default)('getLessonAttendances() - validation error', async () => {
        const getAttendancesResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getAttendancesResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getLessonAttendances() - lesson does not exist', async () => {
        const getAttendancesResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getAttendancesResponse.statusCode, 404, 'Expected the status code to be 404 for a lesson that does not exist.');
    });
    // Might encouter errors because in attendances handler we base on current year and the test data might differ
    (0, node_test_1.default)('getAttendancesStatistics() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson1 = getLessonsResponse.body.data[0];
        const lesson2 = getLessonsResponse.body.data[1];
        const attendancesData1 = {
            lessonId: lesson1.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const attendancesData2 = {
            lessonId: lesson2.id,
            attendances: [
                {
                    wasPresent: false,
                    wasLate: false,
                    wasExcused: true,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse1 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData1);
        node_assert_1.default.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const createAttendancesResponse2 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData2);
        node_assert_1.default.strictEqual(createAttendancesResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/statistics/${signUpResponse1.body.data}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances informations retrieval.');
        console.log(getAttendancesInfoResponse.body.data);
    });
    (0, node_test_1.default)('getAttendancesStatistics() - validation error', async () => {
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/statistics/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getAttendancesStatistics() - student does not exist', async () => {
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/statistics/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('getStudentAttendances() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson1 = getLessonsResponse.body.data[0];
        const lesson2 = getLessonsResponse.body.data[1];
        const attendancesData1 = {
            lessonId: lesson1.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const attendancesData2 = {
            lessonId: lesson2.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse1 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData1);
        node_assert_1.default.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const createAttendancesResponse2 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData2);
        node_assert_1.default.strictEqual(createAttendancesResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const getStudentAttendancesResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/student/${signUpResponse1.body.data}`);
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved attendances to be 2.');
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.body.data[0].lesson_id, lesson1.id, 'Expected the lesson ID to match the created lesson ID.');
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.body.data[0].student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        node_assert_1.default.ok(getStudentAttendancesResponse.body.data[0].lesson, 'Expected the lesson property to exist.');
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.body.data[1].lesson_id, lesson2.id, 'Expected the lesson ID to match the created lesson ID.');
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.body.data[1].student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        node_assert_1.default.ok(getStudentAttendancesResponse.body.data[1].lesson, 'Expected the lesson property to exist.');
    });
    (0, node_test_1.default)('getStudentAttendances() - validation error', async () => {
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/student/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getStudentAttendances() - student does not exist', async () => {
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/student/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('getClassAttendances() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const assignStudentResponse1 = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse1.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const assignStudentResponse2 = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse2.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson1 = getLessonsResponse.body.data[0];
        const attendancesData1 = {
            lessonId: lesson1.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse1 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData1);
        node_assert_1.default.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const getClassAttendancesResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/class/${createClassResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getClassAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        node_assert_1.default.strictEqual(getClassAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved attendances to be 2.');
        node_assert_1.default.strictEqual(getClassAttendancesResponse.body.data[0].lesson_id, lesson1.id, 'Expected the lesson ID to match the created lesson ID.');
        node_assert_1.default.strictEqual(getClassAttendancesResponse.body.data[0].student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        node_assert_1.default.ok(getClassAttendancesResponse.body.data[0].student, 'Expected the student property to exist.');
        node_assert_1.default.ok(getClassAttendancesResponse.body.data[0].lesson, 'Expected the lesson property to exist.');
    });
    (0, node_test_1.default)('getClassAttendances() - validation error', async () => {
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/class/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getClassAttendances() - class does not exist', async () => {
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/class/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('getStudentAttendancesByDate() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const assignStudentResponse1 = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse1.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const assignStudentResponse2 = await (0, requestHelpers_1.sendPatchRequest)(`/class/assign-student/${createClassResponse.body.data.id}`, { studentId: signUpResponse2.body.data });
        node_assert_1.default.strictEqual(assignStudentResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student assignment.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
            classId: createClassResponse.body.data.id,
            subjectId: createSubjectResponse.body.data.id,
            semesterId: createSemesterResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons creation.');
        node_assert_1.default.strictEqual(createLessonsResponse.body.data, 6, 'Expected the number of created lessons to be 6.');
        const getLessonsResponse = await (0, requestHelpers_1.sendGetRequest)(`/lesson/${createClassResponse.body.data.id}/${createSubjectResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getLessonsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful lessons retrieval.');
        node_assert_1.default.strictEqual(getLessonsResponse.body.data.length, 6, 'Expected the number of retrieved lessons to be 6.');
        const lesson1 = getLessonsResponse.body.data[0];
        const lesson2 = getLessonsResponse.body.data[1];
        const attendancesData1 = {
            lessonId: lesson1.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const attendancesData2 = {
            lessonId: lesson2.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse1.body.data
                },
                {
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false,
                    studentId: signUpResponse2.body.data
                }
            ]
        };
        const createAttendancesResponse1 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData1);
        node_assert_1.default.strictEqual(createAttendancesResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const createAttendancesResponse2 = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData2);
        node_assert_1.default.strictEqual(createAttendancesResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const getStudentAttendancesResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/student/${signUpResponse1.body.data}/by-date/${lesson1.date.slice(0, 10)}`);
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.body.data.length, 1, 'Expected the number of retrieved attendances to be 1.');
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.body.data[0].lesson_id, lesson1.id, 'Expected the lesson ID to match the created lesson ID.');
        node_assert_1.default.strictEqual(getStudentAttendancesResponse.body.data[0].student_id, signUpResponse1.body.data, 'Expected the student ID to match the created student ID.');
        node_assert_1.default.ok(getStudentAttendancesResponse.body.data[0].lesson, 'Expected the lesson property to exist.');
        node_assert_1.default.ok(getStudentAttendancesResponse.body.data[0].lesson.subject, 'Expected the subject property to exist.');
    });
    (0, node_test_1.default)('getStudentAttendancesByDate() - validation error', async () => {
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/student/${testData_1.invalidIdUrl}/by-date/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('getStudentAttendancesByDate() - student does not exist', async () => {
        const date = new Date();
        const formattedDate = date.toISOString().slice(0, 10);
        const getAttendancesInfoResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/student/${testData_1.nonExistentId}/by-date/${formattedDate}`);
        node_assert_1.default.strictEqual(getAttendancesInfoResponse.statusCode, 404, 'Expected the status code to be 404 for a student that does not exist.');
    });
    (0, node_test_1.default)('updateAttendances() - success', async () => {
        const createClassNameResponse = await (0, requestHelpers_1.sendPostRequest)('/class-name', testData_1.className1);
        node_assert_1.default.strictEqual(createClassNameResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class name creation.');
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful student signup.');
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        node_assert_1.default.strictEqual(signUpResponse3.statusCode, 200, 'Expected the status code to be 200 for a successful teacher signup.');
        const createClassResponse = await (0, requestHelpers_1.sendPostRequest)('/class', {
            classNameId: createClassNameResponse.body.data.id,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/class/${createClassResponse.body.data.id}`, { teacherId: signUpResponse3.body.data });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful class update.');
        const createSubjectResponse = await (0, requestHelpers_1.sendPostRequest)('/subject', testData_1.subject1);
        node_assert_1.default.strictEqual(createSubjectResponse.statusCode, 200, 'Expected the status code to be 200 for a successful subject creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createLessonsResponse = await (0, requestHelpers_1.sendPostRequest)('/lesson', {
            ...testData_1.lessonsData1,
            teacherId: signUpResponse3.body.data,
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
        const attendancesData = {
            lessonId: lesson.id,
            attendances: [
                {
                    wasPresent: true,
                    wasLate: true,
                    wasExcused: true,
                    studentId: signUpResponse1.body.data,
                },
                {
                    wasPresent: true,
                    wasLate: true,
                    wasExcused: true,
                    studentId: signUpResponse2.body.data,
                }
            ]
        };
        const createAttendancesResponse = await (0, requestHelpers_1.sendPostRequest)('/attendance', attendancesData);
        node_assert_1.default.strictEqual(createAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances creation.');
        const getAttendancesResponse = await (0, requestHelpers_1.sendGetRequest)(`/attendance/${lesson.id}`);
        node_assert_1.default.strictEqual(getAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances retrieval.');
        node_assert_1.default.strictEqual(getAttendancesResponse.body.data.length, 2, 'Expected the number of retrieved lessons to be 2.');
        const attendance1 = getAttendancesResponse.body.data[0];
        const attendance2 = getAttendancesResponse.body.data[1];
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: attendance1.id,
                    wasPresent: false,
                    wasLate: false,
                    wasExcused: false
                },
                {
                    id: attendance2.id,
                    wasPresent: false,
                    wasLate: false,
                    wasExcused: false
                }
            ]
        };
        const updateAttendancesResponse = await (0, requestHelpers_1.sendPatchRequest)(`/attendance/update`, attendancesUpdateData);
        node_assert_1.default.strictEqual(updateAttendancesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful attendances update.');
        node_assert_1.default.strictEqual(updateAttendancesResponse.body.data[0].was_present, false, `Expected the updated attendance presence to be "false".`);
        node_assert_1.default.strictEqual(updateAttendancesResponse.body.data[0].was_late, false, `Expected the updated attendance late flag to be "false".`);
        node_assert_1.default.strictEqual(updateAttendancesResponse.body.data[0].was_excused, false, `Expected the updated attendance excused flag to be "false".`);
        node_assert_1.default.strictEqual(updateAttendancesResponse.body.data[1].was_present, false, `Expected the updated attendance presence to be "false".`);
        node_assert_1.default.strictEqual(updateAttendancesResponse.body.data[1].was_late, false, `Expected the updated attendance late flag to be "false".`);
        node_assert_1.default.strictEqual(updateAttendancesResponse.body.data[1].was_excused, false, `Expected the updated attendance excused flag to be "false".`);
    });
    (0, node_test_1.default)('updateAttendances() - validation error', async () => {
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: testData_1.emptyString,
                    wasPresent: testData_1.emptyString,
                    wasLate: testData_1.emptyString,
                    wasExcused: testData_1.emptyString
                }
            ]
        };
        const updateAttendancesResponse = await (0, requestHelpers_1.sendPatchRequest)(`/attendance/update`, attendancesUpdateData);
        node_assert_1.default.strictEqual(updateAttendancesResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateAttendancesResponse.body.errors.length, 4, 'Expected the number of validation errors to be 4.');
    });
    (0, node_test_1.default)('updateAttendances() - absent and simultaneously late', async () => {
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: testData_1.nonExistentId,
                    wasPresent: false,
                    wasLate: true,
                    wasExcused: true
                }
            ]
        };
        const updateAttendancesResponse = await (0, requestHelpers_1.sendPatchRequest)(`/attendance/update`, attendancesUpdateData);
        node_assert_1.default.strictEqual(updateAttendancesResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was absent and late at the same time.');
    });
    (0, node_test_1.default)('updateAttendances() - present, not late and simultaneously excused', async () => {
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: testData_1.nonExistentId,
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: true
                }
            ]
        };
        const updateAttendanceResponse = await (0, requestHelpers_1.sendPatchRequest)(`/attendance/update`, attendancesUpdateData);
        node_assert_1.default.strictEqual(updateAttendanceResponse.statusCode, 422, 'Status code 422 was expected for the presence which states that one was present, not late and excused at the same time.');
    });
    (0, node_test_1.default)('updateAttendances() - attendance not found', async () => {
        const attendancesUpdateData = {
            attendancesUpdate: [
                {
                    id: testData_1.nonExistentId,
                    wasPresent: true,
                    wasLate: false,
                    wasExcused: false
                }
            ]
        };
        const updateAttendanceResponse = await (0, requestHelpers_1.sendPatchRequest)(`/attendance/update`, attendancesUpdateData);
        node_assert_1.default.strictEqual(updateAttendanceResponse.statusCode, 404, 'Expected the status code to be 404 for a attendance that does not exist.');
    });
});
