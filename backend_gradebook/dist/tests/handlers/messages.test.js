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
const socket_io_client_1 = require("socket.io-client");
const testData_1 = require("../../src/utils/testData");
const requestHelpers_1 = require("../../src/utils/requestHelpers");
const userTypes_1 = require("../../src/enums/userTypes");
(0, node_test_1.suite)('messagesHandler', () => {
    let clientSocket1;
    let clientSocket2;
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.messages.deleteMany();
        await db_1.default.students.deleteMany();
        await db_1.default.teachers.deleteMany();
        if (clientSocket1)
            clientSocket1.close();
        if (clientSocket2)
            clientSocket2.close();
    });
    (0, node_test_1.default)('Join room and receive unread messages - success', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        clientSocket1 = (0, socket_io_client_1.io)(`http://localhost:3000`);
        clientSocket1.emit('join', signUpResponse1.body.data);
        clientSocket1.emit('send_message', {
            ...testData_1.messageData,
            senderId: signUpResponse1.body.data,
            senderTypeId: userTypes_1.UserType.Student,
            receiverId: signUpResponse2.body.data,
            receiverTypeId: userTypes_1.UserType.Student
        });
        clientSocket1.emit('send_message', {
            ...testData_1.messageData,
            senderId: signUpResponse3.body.data,
            senderTypeId: userTypes_1.UserType.Teacher,
            receiverId: signUpResponse3.body.data,
            receiverTypeId: userTypes_1.UserType.Teacher
        });
        clientSocket2 = (0, socket_io_client_1.io)(`http://localhost:3000`);
        clientSocket2.emit('join', signUpResponse2.body.data);
        await (async () => {
            clientSocket2.on('receive_messages', (messages) => {
                (0, node_assert_1.default)(Array.isArray(messages), 'Expected messages to be an array.');
                node_assert_1.default.strictEqual(messages.length, 1, 'Expected 1 unread message.');
                node_assert_1.default.strictEqual(messages[0].subject, testData_1.messageData.subject, `Expected the message subject to be "${testData_1.messageData.subject}".`);
                node_assert_1.default.strictEqual(messages[0].content, testData_1.messageData.content, `Expected the message content to be "${testData_1.messageData.content}".`);
            });
        })();
    });
    (0, node_test_1.default)('Send and receive message in real-time', async () => {
        const signUpResponse1 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student1);
        const signUpResponse2 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/student', testData_1.student2);
        const signUpResponse3 = await (0, requestHelpers_1.sendPostRequest)('/auth/signup/teacher', testData_1.teacher1);
        clientSocket1 = (0, socket_io_client_1.io)(`http://localhost:3000`);
        clientSocket1.emit('join', signUpResponse1.body.data);
        clientSocket2 = (0, socket_io_client_1.io)(`http://localhost:3000`);
        clientSocket2.emit('join', signUpResponse2.body.data);
        await (async () => {
            clientSocket2.on('receive_message', (messages) => {
                const msg = messages[0];
                node_assert_1.default.strictEqual(msg.subject, testData_1.messageData.subject, 'Expected message subject to match.');
                node_assert_1.default.strictEqual(msg.content, testData_1.messageData.content, 'Expected message content to match.');
                node_assert_1.default.strictEqual(msg.sender_id, signUpResponse1.body.data, 'Expected sender ID to match.');
                node_assert_1.default.strictEqual(msg.receiver_id, signUpResponse2.body.data, 'Expected receiver ID to match.');
            });
            clientSocket1.emit('send_message', {
                ...testData_1.messageData,
                senderId: signUpResponse1.body.data,
                senderTypeId: userTypes_1.UserType.Student,
                receiverId: signUpResponse2.body.data,
                receiverTypeId: userTypes_1.UserType.Student
            });
            clientSocket1.emit('send_message', {
                ...testData_1.messageData,
                senderId: signUpResponse3.body.data,
                senderTypeId: userTypes_1.UserType.Teacher,
                receiverId: signUpResponse3.body.data,
                receiverTypeId: userTypes_1.UserType.Teacher
            });
        });
    });
});
