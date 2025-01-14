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
(0, node_test_1.suite)('semestersRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.semesters.deleteMany();
        await db_1.default.school_years.deleteMany();
    });
    (0, node_test_1.default)('createSemester() - success', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        node_assert_1.default.strictEqual(createSemesterResponse.body.data.semester, testData_1.semester1.semester, `Expected the semester to be "${testData_1.semester1.semester}".`);
        node_assert_1.default.strictEqual(createSemesterResponse.body.data.start_date, new Date(testData_1.semester1.startDate).toISOString(), `Expected the startDate to be "${testData_1.semester1.startDate}".`);
        node_assert_1.default.strictEqual(createSemesterResponse.body.data.end_date, new Date(testData_1.semester1.endDate).toISOString(), `Expected the endDate to be "${testData_1.semester1.endDate}".`);
        node_assert_1.default.strictEqual(createSemesterResponse.body.data.school_year_id, createSchoolYearResponse.body.data.id, `Expected the schoolYearId to be "${createSchoolYearResponse.body.data.id}".`);
    });
    (0, node_test_1.default)('createSemester() - validation error', async () => {
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            semester: testData_1.emptyString,
            startDate: testData_1.emptyString,
            endDate: testData_1.emptyString,
            schoolYearId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createSemesterResponse.body.errors.length, 4, 'Expected the number of validation errors to be 4.');
    });
    (0, node_test_1.default)('createSemester() - semester already exists', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse1 = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createSemesterResponse2 = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse2.statusCode, 409, 'Expected the status code to be 409 for a semester that already exists.');
    });
    (0, node_test_1.default)('createSemester() - school year does not exist', async () => {
        const createSemesterResponse1 = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createSemesterResponse1.statusCode, 404, 'Expected the status code to be 409 for a semester that does not exist.');
    });
    (0, node_test_1.default)('createSemester() - start date is before end date', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse1 = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...{
                semester: 1,
                startDate: '2025-02-10',
                endDate: '2024-10-01'
            },
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse1.statusCode, 400, 'Expected the status code to be 400 for a start date that is before an end date.');
    });
    (0, node_test_1.default)('createSemester() - semester dates are not within the school year dates', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse1 = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester4,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse1.statusCode, 400, 'Expected the status code to be 400 for a semester dates that are not within the school year dates.');
    });
    (0, node_test_1.default)('getSemesters() - success', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse1 = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const createSemesterResponse2 = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester2,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const getSemestersResponse = await (0, requestHelpers_1.sendGetRequest)(`/semester/${createSchoolYearResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getSemestersResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semesters retrieval.');
        node_assert_1.default.strictEqual(getSemestersResponse.body.data.length, 2, 'Expected the number of retrieved semesters to be 2.');
    });
    (0, node_test_1.default)('getSemesters() - validation error', async () => {
        const getSemestersResponse = await (0, requestHelpers_1.sendGetRequest)(`/semester/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getSemestersResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getSemestersResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getSemesters() - school year does not exist', async () => {
        const getSemestersResponse = await (0, requestHelpers_1.sendGetRequest)(`/semester/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getSemestersResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });
    (0, node_test_1.default)('updateSemester() - success', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const updateSemesterResponse = await (0, requestHelpers_1.sendPatchRequest)(`/semester/${createSemesterResponse.body.data.id}`, {
            semester: testData_1.semester2.semester,
            startDate: testData_1.semester2.startDate,
            endDate: testData_1.semester2.endDate
        });
        node_assert_1.default.strictEqual(updateSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester update.');
        node_assert_1.default.strictEqual(updateSemesterResponse.body.data.semester, testData_1.semester2.semester, `Expected the updated semester number to be "${testData_1.semester2.semester}".`);
        node_assert_1.default.strictEqual(updateSemesterResponse.body.data.start_date, new Date(testData_1.semester2.startDate).toISOString(), `Expected the updated startDate to be "${testData_1.semester2.startDate}".`);
        node_assert_1.default.strictEqual(updateSemesterResponse.body.data.end_date, new Date(testData_1.semester2.endDate).toISOString(), `Expected the updated endDate to be "${testData_1.semester2.endDate}".`);
    });
    (0, node_test_1.default)('updateSemester() - validation error', async () => {
        const updateSemesterResponse = await (0, requestHelpers_1.sendPatchRequest)(`/semester/${testData_1.invalidIdUrl}`, {
            semester: testData_1.emptyString,
            startDate: testData_1.emptyString,
            endDate: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateSemesterResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateSemesterResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateSemester() - semester does not exist', async () => {
        const updateSemesterResponse = await (0, requestHelpers_1.sendPatchRequest)(`/semester/${testData_1.nonExistentId}`, {
            semester: testData_1.semester2.semester,
            startDate: testData_1.semester2.startDate,
            endDate: testData_1.semester2.endDate
        });
        node_assert_1.default.strictEqual(updateSemesterResponse.statusCode, 404, 'Expected the status code to be 404 for a semester that does not exist.');
    });
    (0, node_test_1.default)('deleteSemester() - success', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSemesterResponse = await (0, requestHelpers_1.sendPostRequest)('/semester', {
            ...testData_1.semester1,
            schoolYearId: createSchoolYearResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester creation.');
        const deleteSemesterResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/semester/${createSemesterResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteSemesterResponse.statusCode, 200, 'Expected the status code to be 200 for a successful semester deletion.');
        node_assert_1.default.strictEqual(deleteSemesterResponse.body.data.id, createSemesterResponse.body.data.id, 'Expected the deleted semester ID to match the created semester ID.');
    });
    (0, node_test_1.default)('deleteSemester() - validation error', async () => {
        const deleteSemesterResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/semester/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteSemesterResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteSemesterResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteSemester() - semester does not exist', async () => {
        const deleteSemesterResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/semester/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteSemesterResponse.statusCode, 404, 'Expected the status code to be 404 for a semester that does not exist.');
    });
});
