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
(0, node_test_1.suite)('userTypesRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.user_types.deleteMany();
    });
    (0, node_test_1.default)('createUserType() - success', async () => {
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        node_assert_1.default.strictEqual(createUserTypeResponse.body.data.name, testData_1.userType1.name, `Expected the user type name to be "${testData_1.userType1.name}".`);
    });
    (0, node_test_1.default)('createUserType() - validation error', async () => {
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', {
            name: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createUserTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('createUserType() - user type already exists', async () => {
        const createUserTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful user-type creation.');
        const createUserTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse2.statusCode, 409, 'Expected the status code to be 409 for a user type that already exists.');
    });
    (0, node_test_1.default)('getUserTypes() - success', async () => {
        const createUserTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful user-type creation.');
        const createUserTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType2);
        node_assert_1.default.strictEqual(createUserTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful user-type creation.');
        const getUserTypesResponse = await (0, requestHelpers_1.sendGetRequest)('/user-type');
        node_assert_1.default.strictEqual(getUserTypesResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user-types retrieval.');
        node_assert_1.default.strictEqual(getUserTypesResponse.body.data.length, 2, 'Expected the number of retrieved user-types to be 2.');
    });
    (0, node_test_1.default)('deleteUserType() - success', async () => {
        const createUserTypeResponse = await (0, requestHelpers_1.sendPostRequest)('/user-type', testData_1.userType1);
        node_assert_1.default.strictEqual(createUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type creation.');
        const deleteUserTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/user-type/${createUserTypeResponse.body.data.id}`);
        node_assert_1.default.strictEqual(deleteUserTypeResponse.statusCode, 200, 'Expected the status code to be 200 for a successful user type deletion.');
        node_assert_1.default.strictEqual(deleteUserTypeResponse.body.data.id, createUserTypeResponse.body.data.id, 'Expected the deleted user type ID to match the created user type ID.');
    });
    (0, node_test_1.default)('deleteUserType() - validation error', async () => {
        const deleteUserTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/user-type/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(deleteUserTypeResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(deleteUserTypeResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('deleteUserType() - user type does not exist', async () => {
        const deleteUserTypeResponse = await (0, requestHelpers_1.sendDeleteRequest)(`/user-type/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(deleteUserTypeResponse.statusCode, 404, 'Expected the status code to be 404 for a user type that does not exist.');
    });
});
