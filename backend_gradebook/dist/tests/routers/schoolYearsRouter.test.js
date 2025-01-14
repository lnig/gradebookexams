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
(0, node_test_1.suite)('schoolYearsRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.school_years.deleteMany();
    });
    (0, node_test_1.default)('createSchoolYear() - success', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        node_assert_1.default.strictEqual(createSchoolYearResponse.body.data.name, testData_1.schoolYear1.name, `Expected the name to be "${testData_1.schoolYear1.name}".`);
        node_assert_1.default.strictEqual(createSchoolYearResponse.body.data.start_date, new Date(testData_1.schoolYear1.startDate).toISOString(), `Expected the startDate to be "${testData_1.schoolYear1.startDate}".`);
        node_assert_1.default.strictEqual(createSchoolYearResponse.body.data.end_date, new Date(testData_1.schoolYear1.endDate).toISOString(), `Expected the endDate to be "${testData_1.schoolYear1.endDate}".`);
    });
    (0, node_test_1.default)('createSchoolYear() - validation error', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', {
            name: testData_1.emptyString,
            startDate: testData_1.emptyString,
            endDate: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createSchoolYearResponse.body.errors.length, 3, 'Expected the number of validation errors to be 3.');
    });
    (0, node_test_1.default)('createSchoolYear() - school year already exists', async () => {
        const createSchoolYearResponse1 = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSchoolYearResponse2 = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse2.statusCode, 409, 'Expected the status code to be 409 for a school year that already exists.');
    });
    (0, node_test_1.default)('createSchoolYear() - start date is before end date', async () => {
        const createSchoolYearResponse1 = await (0, requestHelpers_1.sendPostRequest)('/school-year', {
            name: '2024/2025',
            startDate: '2025-06-30',
            endDate: '2024-10-01'
        });
        node_assert_1.default.strictEqual(createSchoolYearResponse1.statusCode, 400, 'Expected the status code to be 400 for a start date that is before an end date.');
    });
    (0, node_test_1.default)('getSchoolYear() - success', async () => {
        const createSchoolYearResponse1 = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const createSchoolYearResponse2 = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear2);
        node_assert_1.default.strictEqual(createSchoolYearResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const getSchoolYearsResponse = await (0, requestHelpers_1.sendGetRequest)('/school-year');
        node_assert_1.default.strictEqual(getSchoolYearsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school years retrieval.');
        node_assert_1.default.strictEqual(getSchoolYearsResponse.body.data.length, 2, 'Expected the number of retrieved school years to be 2.');
    });
    (0, node_test_1.default)('updateSchoolYear() - success', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const updateClassResponse = await (0, requestHelpers_1.sendPatchRequest)(`/school-year/${createSchoolYearResponse.body.data.id}`, {
            name: testData_1.schoolYear1.name,
            startDate: testData_1.schoolYear1.startDate,
            endDate: testData_1.schoolYear1.endDate
        });
        node_assert_1.default.strictEqual(updateClassResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year update.');
        node_assert_1.default.strictEqual(updateClassResponse.body.data.id, createSchoolYearResponse.body.data.id, 'Expected the updated school year ID to match the created school year ID.');
        node_assert_1.default.strictEqual(updateClassResponse.body.data.name, testData_1.schoolYear1.name, `Expected the updated school year name to be "${testData_1.schoolYear1.name}".`);
        node_assert_1.default.strictEqual(updateClassResponse.body.data.start_date, new Date(testData_1.schoolYear1.startDate).toISOString(), `Expected the updated start date to be "${testData_1.schoolYear1.startDate}".`);
        node_assert_1.default.strictEqual(updateClassResponse.body.data.end_date, new Date(testData_1.schoolYear1.endDate).toISOString(), `Expected the updated end date to be "${testData_1.schoolYear1.endDate}".`);
    });
    (0, node_test_1.default)('updateSchoolYear() - validation error', async () => {
        const updateSchoolYearResponse = await (0, requestHelpers_1.sendPatchRequest)(`/school-year/${testData_1.invalidIdUrl}`, {
            name: testData_1.emptyString,
            startDate: testData_1.emptyString,
            endDate: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateSchoolYearResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateSchoolYearResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateSchoolYear() - school year does not exist', async () => {
        const updateSchoolYearResponse = await (0, requestHelpers_1.sendPatchRequest)(`/school-year/${testData_1.nonExistentId}`, {
            name: testData_1.schoolYear1.name,
            startDate: testData_1.schoolYear1.startDate,
            endDate: testData_1.schoolYear1.endDate,
        });
        node_assert_1.default.strictEqual(updateSchoolYearResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });
    (0, node_test_1.default)('deleteSchoolYear() - success', async () => {
        const createSchoolYearResponse = await (0, requestHelpers_1.sendPostRequest)('/school-year', testData_1.schoolYear1);
        node_assert_1.default.strictEqual(createSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year creation.');
        const deleteSchoolYearResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/school-year/${createSchoolYearResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteSchoolYearResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school year deletion.');
        node_assert_1.default.strictEqual(deleteSchoolYearResponse.body.data.id, createSchoolYearResponse.body.data.id, 'Expected the deleted school year ID to match the created school year ID.');
    });
    (0, node_test_1.default)('deleteSchoolYear() - validation error', async () => {
        const deleteClassResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/class/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteClassResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteClassResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteSchoolYear() - school year does not exist', async () => {
        const deleteSchoolYearResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/school-year/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteSchoolYearResponse.statusCode, 404, 'Expected the status code to be 404 for a school year that does not exist.');
    });
});
