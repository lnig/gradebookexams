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
(0, node_test_1.suite)('eventTypesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.event_types.deleteMany();
    });
    (0, node_test_1.default)('createEventType() - success', async () => {
        const createEventTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1,
        });
        node_assert_1.default.strictEqual(createEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        node_assert_1.default.strictEqual(createEventTypeResponse.body.data.name, testData_1.eventType1.name, `Expected the event type name to be "${testData_1.eventType1.name}".`);
    });
    (0, node_test_1.default)('createEventType() - validation error', async () => {
        const createEventTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            name: testData_1.emptyString,
        });
        node_assert_1.default.strictEqual(createEventTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createEventTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('createEventType() - event type already exists', async () => {
        const createEventTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1
        });
        node_assert_1.default.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createEventTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1
        });
        node_assert_1.default.strictEqual(createEventTypeResponse2.statusCode, 409, 'Expected the status code to be 404 for a event type that already exists.');
    });
    (0, node_test_1.default)('getEventTypes() - success', async () => {
        const createEventTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1
        });
        node_assert_1.default.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createEventTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType2
        });
        node_assert_1.default.strictEqual(createEventTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const getEventTypesResponse = await (0, requestHelpers_1.sendGetRequest)(`/event-type`);
        node_assert_1.default.strictEqual(getEventTypesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event types retrieval.');
        node_assert_1.default.strictEqual(getEventTypesResponse.body.data.length, 2, 'Expected the number of retrieved event types to be 2.');
    });
    (0, node_test_1.default)('getEventType() - success', async () => {
        const createEventTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1
        });
        node_assert_1.default.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const createEventTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType2
        });
        node_assert_1.default.strictEqual(createEventTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const getEventTypeResponse = await (0, requestHelpers_1.sendGetRequest)(`/event-type/${createEventTypeResponse1.body.data.id}`);
        node_assert_1.default.strictEqual(getEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type retrieval.');
        node_assert_1.default.strictEqual(getEventTypeResponse.body.data.name, testData_1.eventType1.name, `Expected the event type name to be "${testData_1.eventType1.name}".`);
    });
    (0, node_test_1.default)('getEventType() - validation error', async () => {
        const getEventTypeResponse = await (0, requestHelpers_1.sendGetRequest)(`/event-type/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getEventTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getEventTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getEventType() - event type does not exist', async () => {
        const getGradesResponse = await (0, requestHelpers_1.sendGetRequest)(`/event-type/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getGradesResponse.statusCode, 404, 'Expected the status code to be 404 for a event type that does not exist.');
    });
    (0, node_test_1.default)('updateEventType() - success', async () => {
        const createEventTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1
        });
        node_assert_1.default.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const updateEventTypeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/event-type/${createEventTypeResponse1.body.data.id}`, {
            name: testData_1.eventType2.name
        });
        node_assert_1.default.strictEqual(updateEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type update.');
        node_assert_1.default.strictEqual(updateEventTypeResponse.body.data.name, testData_1.eventType2.name, `Expected the updated event type name to be "${testData_1.eventType2.name}".`);
    });
    (0, node_test_1.default)('updateEventType() - validation error', async () => {
        const updateEventTypeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/event-type/${testData_1.invalidIdUrl}`, {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(updateEventTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateEventTypeResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('updateEventType() - event type does not exist', async () => {
        const updateEventTypeResponse = await (0, requestHelpers_1.sendPatchRequest)(`/event-type/${testData_1.nonExistentId}`, {
            name: testData_1.eventType2.name
        });
        node_assert_1.default.strictEqual(updateEventTypeResponse.statusCode, 404, 'Expected the status code to be 404 for an event type that does not exist.');
    });
    (0, node_test_1.default)('deleteEventType() - success', async () => {
        const createEventTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/event-type', {
            ...testData_1.eventType1
        });
        node_assert_1.default.strictEqual(createEventTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful event type creation.');
        const deleteEventTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/event-type/${createEventTypeResponse1.body.data.id}`);
        node_assert_1.default.strictEqual(deleteEventTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful event type deletion.');
        node_assert_1.default.strictEqual(deleteEventTypeResponse.body.data.id, createEventTypeResponse1.body.data.id, 'Expected the deleted event type ID to match the created event type ID.');
    });
    (0, node_test_1.default)('deleteEventType() - validation error', async () => {
        const deleteEventTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/event-type/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteEventTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteEventTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteEventType() - event type does not exist', async () => {
        const deleteEventTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/event-type/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteEventTypeResponse.statusCode, 404, 'Expected the status code to be 404 for an event type that does not exist.');
    });
});
