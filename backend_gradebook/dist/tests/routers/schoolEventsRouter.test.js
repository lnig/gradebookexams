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
(0, node_test_1.suite)('schoolEventsRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.school_events.deleteMany();
        await db_1.default.event_types.deleteMany();
    });
    (0, node_test_1.default)('createSchoolEvent() - success', async () => {
        const createEventTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1,
        });
        node_assert_1.default.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createSchoolEventResponse = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            ...testData_1.schoolEvent1,
            eventTypeId: createEventTypeResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');
        node_assert_1.default.strictEqual(createSchoolEventResponse.body.data.name, testData_1.schoolEvent1.name, `Expected the name to be "${testData_1.schoolEvent1.name}".`);
        node_assert_1.default.strictEqual(createSchoolEventResponse.body.data.location, testData_1.schoolEvent1.location, `Expected the location to be "${testData_1.schoolEvent1.location}".`);
        node_assert_1.default.strictEqual(createSchoolEventResponse.body.data.description, testData_1.schoolEvent1.description, `Expected the description to be "${testData_1.schoolEvent1.description}"`);
        node_assert_1.default.strictEqual(createSchoolEventResponse.body.data.date, new Date(testData_1.schoolEvent1.date).toISOString(), `Expected the date to be ${new Date(testData_1.schoolEvent1.date).toISOString()}.`);
    });
    (0, node_test_1.default)('createSchoolEvent() - validation error', async () => {
        const createGradeResponse = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            name: testData_1.emptyString,
            location: testData_1.emptyString,
            description: testData_1.emptyString,
            date: testData_1.emptyString,
            startTime: testData_1.emptyString,
            endTime: testData_1.emptyString,
            eventTypeId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createGradeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createGradeResponse.body.errors.length, 7, 'Expected the number of validation errors to be 7.');
    });
    (0, node_test_1.default)('createSchoolEvent() - event type does not exist', async () => {
        const createSchoolEventResponse = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            ...testData_1.schoolEvent1,
            eventTypeId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(createSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for an event type that does not exist.');
    });
    (0, node_test_1.default)('getSchoolEvents() - success', async () => {
        const createEventTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1
        });
        node_assert_1.default.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createEventTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType2
        });
        node_assert_1.default.strictEqual(createEventTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createSchoolEventResponse1 = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            ...testData_1.schoolEvent1,
            eventTypeId: createEventTypeResponse1.body.data.id
        });
        node_assert_1.default.strictEqual(createSchoolEventResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');
        const createSchoolEventResponse2 = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            ...testData_1.schoolEvent2,
            eventTypeId: createEventTypeResponse2.body.data.id
        });
        node_assert_1.default.strictEqual(createSchoolEventResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');
        const getSchoolEventsResponse = await (0, requestHelpers_1.sendGetRequest)('/school-event');
        node_assert_1.default.strictEqual(getSchoolEventsResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school events retrieval.');
        node_assert_1.default.strictEqual(getSchoolEventsResponse.body.data.length, 2, 'Expected the number of retrieved school events to be 2.');
    });
    (0, node_test_1.default)('getSchoolEvent() - success', async () => {
        const createEventTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1
        });
        node_assert_1.default.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createSchoolEventResponse = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            ...testData_1.schoolEvent1,
            eventTypeId: createEventTypeResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');
        const getSchoolEventResponse = await (0, requestHelpers_1.sendGetRequest)(`/school-event/${createSchoolEventResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event retrieval.');
        node_assert_1.default.strictEqual(createSchoolEventResponse.body.data.name, testData_1.schoolEvent1.name, `Expected the name to be "${testData_1.schoolEvent1.name}".`);
        node_assert_1.default.strictEqual(createSchoolEventResponse.body.data.location, testData_1.schoolEvent1.location, `Expected the location to be "${testData_1.schoolEvent1.location}".`);
        node_assert_1.default.strictEqual(createSchoolEventResponse.body.data.description, testData_1.schoolEvent1.description, `Expected the description to be "${testData_1.schoolEvent1.description}"`);
        node_assert_1.default.strictEqual(createSchoolEventResponse.body.data.date, new Date(testData_1.schoolEvent1.date).toISOString(), `Expected the date to be ${new Date(testData_1.schoolEvent1.date).toISOString()}.`);
    });
    (0, node_test_1.default)('getSchoolEvent() - validation error', async () => {
        const getSchoolEventResponse = await (0, requestHelpers_1.sendGetRequest)(`/school-event/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getSchoolEventResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getSchoolEventResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getSchoolEvent() - school event does not exist', async () => {
        const getSchoolEventResponse = await (0, requestHelpers_1.sendGetRequest)(`/school-event/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for a school event that does not exist.');
    });
    (0, node_test_1.default)('updateSchoolEvent() - success', async () => {
        const createEventTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1,
        });
        node_assert_1.default.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createEventTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType2,
        });
        node_assert_1.default.strictEqual(createEventTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createSchoolEventResponse = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            ...testData_1.schoolEvent1,
            eventTypeId: createEventTypeResponse1.body.data.id
        });
        node_assert_1.default.strictEqual(createSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');
        const updateSchoolEventResponse = await (0, requestHelpers_1.sendPatchRequest)(`/school-event/${createSchoolEventResponse.body.data.id}`, {
            ...testData_1.schoolEvent2,
            eventTypeId: createEventTypeResponse2.body.data.id
        });
        node_assert_1.default.strictEqual(updateSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event update.');
        node_assert_1.default.strictEqual(updateSchoolEventResponse.body.data.name, testData_1.schoolEvent2.name, `Expected the name to be "${testData_1.schoolEvent2.name}".`);
        node_assert_1.default.strictEqual(updateSchoolEventResponse.body.data.location, testData_1.schoolEvent2.location, `Expected the location to be "${testData_1.schoolEvent2.location}".`);
        node_assert_1.default.strictEqual(updateSchoolEventResponse.body.data.description, testData_1.schoolEvent2.description, `Expected the description to be "${testData_1.schoolEvent2.description}"`);
        node_assert_1.default.strictEqual(updateSchoolEventResponse.body.data.date, new Date(testData_1.schoolEvent2.date).toISOString(), `Expected the date to be ${new Date(testData_1.schoolEvent2.date).toISOString()}.`);
        node_assert_1.default.strictEqual(updateSchoolEventResponse.body.data.event_type_id, createEventTypeResponse2.body.data.id, `Expected the event type ID to be "${createEventTypeResponse2.body.data.id}".`);
    });
    (0, node_test_1.default)('updateSchoolEvent() - validation error', async () => {
        const updateSchoolEventResponse = await (0, requestHelpers_1.sendPatchRequest)(`/school-event/${testData_1.invalidIdUrl}`, {
            name: testData_1.emptyString,
            location: testData_1.emptyString,
            description: testData_1.emptyString,
            date: testData_1.emptyString,
            startTime: testData_1.emptyString,
            endTime: testData_1.emptyString,
            eventTypeId: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateSchoolEventResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateSchoolEventResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateSchoolEvent() - school event does not exist', async () => {
        const updateSchoolEventResponse = await (0, requestHelpers_1.sendPatchRequest)(`/school-event/${testData_1.nonExistentId}`, {
            ...testData_1.schoolEvent2,
        });
        node_assert_1.default.strictEqual(updateSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for a school event that does not exist.');
    });
    (0, node_test_1.default)('updateSchoolEvent() - event type does not exist', async () => {
        const createEventTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1,
        });
        node_assert_1.default.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createSchoolEventResponse = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            ...testData_1.schoolEvent1,
            eventTypeId: createEventTypeResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');
        const updateSchoolEventResponse = await (0, requestHelpers_1.sendPatchRequest)(`/school-event/${createSchoolEventResponse.body.data.id}`, {
            ...testData_1.schoolEvent2,
            eventTypeId: testData_1.nonExistentId
        });
        node_assert_1.default.strictEqual(updateSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for an event type that does not exist.');
    });
    (0, node_test_1.default)('deleteSchoolEvent() - success', async () => {
        const createEventTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1,
        });
        node_assert_1.default.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createSchoolEventResponse = await (0, requestHelpers_1.sendPostRequest)('/school-event', {
            ...testData_1.schoolEvent1,
            eventTypeId: createEventTypeResponse.body.data.id
        });
        node_assert_1.default.strictEqual(createSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event creation.');
        const deleteSchoolEventResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/school-event/${createSchoolEventResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteSchoolEventResponse.statusCode, 200, 'Expected the status code to be 200 for a successful school event deletion.');
        node_assert_1.default.strictEqual(deleteSchoolEventResponse.body.data.id, createSchoolEventResponse.body.data.id, 'Expected the deleted school event ID to match the created school event ID.');
    });
    (0, node_test_1.default)('deleteSchoolEvent() - validation error', async () => {
        const deleteSchoolEventResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/school-event/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteSchoolEventResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteSchoolEventResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteSchoolEvent() - school event does not exist', async () => {
        const deleteSchoolEventResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/school-event/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteSchoolEventResponse.statusCode, 404, 'Expected the status code to be 404 for a school event that does not exist.');
    });
});
