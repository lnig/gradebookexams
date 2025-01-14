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
const auth_1 = require("../../src/modules/auth");
const testData_1 = require("../../src/utils/testData");
const uuid_1 = require("uuid");
(0, node_test_1.suite)('authRouter', () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.administrators.deleteMany();
        await db_1.default.teachers.deleteMany();
        await db_1.default.parents.deleteMany();
        await db_1.default.students.deleteMany();
    });
    (0, node_test_1.default)('signIn() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/administrator', testData_1.administrator1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const signInResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signin', {
            email: testData_1.administrator1.email,
            password: testData_1.administrator1.password
        });
        node_assert_1.default.strictEqual(signInResponse.statusCode, 200, 'Expected the status code to be 200 for a successful sign-in.');
        node_assert_1.default.strictEqual(signInResponse.body.data.id, signUpResponse.body.data, 'Expected the signed-in user ID to match the signed-up user ID.');
    });
    (0, node_test_1.default)('signIn() - validation error', async () => {
        const signInResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signin', {
            email: testData_1.emptyString,
            password: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(signInResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(signInResponse.body.errors.length, 2, 'Expected the number of validation errors to be 2.');
    });
    (0, node_test_1.default)('signIn() - non-existent email', async () => {
        const signInResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signin', {
            email: testData_1.nonExistentEmail,
            password: testData_1.nonExistentPassword
        });
        node_assert_1.default.strictEqual(signInResponse.statusCode, 404, 'Expected the status code to be 404 for a non-existent email.');
    });
    (0, node_test_1.default)('signIn() - incorrect password', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/administrator', testData_1.administrator1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const signInResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signin', {
            email: testData_1.administrator1.email,
            password: testData_1.nonExistentPassword
        });
        node_assert_1.default.strictEqual(signInResponse.statusCode, 401, 'Expected the status code to be 401 for an incorrect password.');
    });
    (0, node_test_1.default)('signUp() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/administrator', testData_1.administrator1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        node_assert_1.default.strictEqual((0, uuid_1.validate)(signUpResponse.body.data), true, 'Expected the response data to be a valid UUID for a successful signup.');
    });
    (0, node_test_1.default)('signUp() - validation error', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/administrator', {
            pesel: testData_1.emptyString,
            email: testData_1.emptyString,
            phoneNumber: testData_1.emptyString,
            password: testData_1.emptyString,
            passwordConfirm: testData_1.emptyString,
            firstName: testData_1.emptyString,
            lastName: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(signUpResponse.body.errors.length, 9, 'Expected the number of validation errors to be 9.');
    });
    (0, node_test_1.default)('signUp() - user already exists', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/administrator', testData_1.administrator1);
        node_assert_1.default.strictEqual(signUpResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/administrator', testData_1.administrator1);
        node_assert_1.default.strictEqual(signUpResponse2.statusCode, 409, 'Expected the status code to be 409 for a user that already exists.');
    });
    (0, node_test_1.default)('forgotPassword() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/administrator', testData_1.administrator1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const forgotPasswordResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/forgot-password', {
            email: testData_1.administrator1.email
        });
        node_assert_1.default.strictEqual(forgotPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for successfully sending a password reset email.');
        const updatedUser = await db_1.default.administrators.findUnique({
            where: {
                email: testData_1.administrator1.email
            }
        });
        node_assert_1.default.notStrictEqual(updatedUser, null, 'Expected the user to be found.');
        node_assert_1.default.notStrictEqual(updatedUser.reset_password_token, null, 'Expected the reset password token to be set.');
        node_assert_1.default.notStrictEqual(updatedUser.reset_password_expires, null, 'Expected the reset password expiry date to be set.');
    });
    (0, node_test_1.default)('forgotPassword() - validation error', async () => {
        const forgotPasswordResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/forgot-password', {
            email: testData_1.emptyString
        });
        node_assert_1.default.strictEqual(forgotPasswordResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(forgotPasswordResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('forgotPassword() - non-existent email', async () => {
        const forgotPasswordResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/forgot-password', {
            email: testData_1.nonExistentEmail
        });
        node_assert_1.default.strictEqual(forgotPasswordResponse.statusCode, 404, 'Expected the status code to be 404 for a non-existent email.');
    });
    (0, node_test_1.default)('resetPassword() - success', async () => {
        const signUpResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/administrator', testData_1.administrator1);
        node_assert_1.default.strictEqual(signUpResponse.statusCode, 200, 'Expected the status code to be 200 for a successful signup.');
        const forgotPasswordResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/forgot-password', {
            email: testData_1.administrator1.email
        });
        node_assert_1.default.strictEqual(forgotPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for successfully sending a password reset email.');
        const signInResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/signin', {
            email: testData_1.administrator1.email,
            password: testData_1.administrator1.password,
        });
        const resetPasswordResponse = await (0, requestHelpers_1.sendPostRequest)('/auth/reset-password', { password: testData_1.newPassword }, signInResponse.body.data.jwt);
        node_assert_1.default.strictEqual(resetPasswordResponse.statusCode, 200, 'Expected the status code to be 200 for a successful password reset.');
        node_assert_1.default.strictEqual(await (0, auth_1.comparePasswords)(testData_1.newPassword, resetPasswordResponse.body.data.password), true, `Expected the new password to be "${testData_1.newPassword}".`);
    });
});
