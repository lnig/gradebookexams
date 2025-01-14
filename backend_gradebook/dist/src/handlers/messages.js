"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentConversations = exports.getMessagesBetweenUsers = exports.getUnreadMessages = void 0;
exports.messagesHandler = messagesHandler;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
function messagesHandler(io, socket) {
    const user = socket.user;
    socket.join(user.id);
    console.log(`User ${user.id} joined rooms ${user.id}`);
    socket.on('send_message', async (data) => {
        try {
            if (!data.subject ||
                !data.content ||
                !data.senderId ||
                !data.receiverId ||
                !data.senderTypeId ||
                !data.receiverTypeId) {
                throw new Error("Invalid message data");
            }
            if (data.senderId.toString() !== user.id) {
                throw new Error('Sender ID mismatch');
            }
            const message = await db_1.default.messages.create({
                data: {
                    subject: data.subject,
                    content: data.content,
                    date_time: new Date(),
                    was_read: false,
                    sender_id: Buffer.from((0, uuid_1.parse)(data.senderId)),
                    sender_type_id: Buffer.from((0, uuid_1.parse)(data.senderTypeId)),
                    receiver_id: Buffer.from((0, uuid_1.parse)(data.receiverId)),
                    receiver_type_id: Buffer.from((0, uuid_1.parse)(data.receiverTypeId)),
                },
            });
            io.to([data.senderId, data.receiverId]).emit('receive_message', {
                ...message,
                id: (0, uuid_1.stringify)(message.id),
                date_time: message.date_time.toISOString(),
                sender_id: data.senderId,
                sender_type_id: data.senderTypeId,
                receiver_id: data.receiverId,
                receiver_type_id: data.receiverTypeId,
            });
        }
        catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", "Failed to send message");
        }
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
}
;
const getUnreadMessages = async (req, res) => {
    try {
        const user = req.user;
        const unreadMessages = await db_1.default.messages.findMany({
            where: {
                receiver_id: Buffer.from((0, uuid_1.parse)(user.id)),
                was_read: false,
            },
        });
        const responseData = unreadMessages.map(message => ({
            ...message,
            id: (0, uuid_1.stringify)(message.id),
            date_time: message.date_time.toISOString(),
            sender_id: (0, uuid_1.stringify)(message.sender_id),
            sender_type_id: (0, uuid_1.stringify)(message.sender_type_id),
            receiver_id: (0, uuid_1.stringify)(message.receiver_id),
            receiver_type_id: (0, uuid_1.stringify)(message.receiver_type_id),
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Unread messages retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving unread messages:', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving unread messages. Please try again later.'));
    }
};
exports.getUnreadMessages = getUnreadMessages;
const getMessagesBetweenUsers = async (req, res) => {
    try {
        const user = req.user;
        const interlocutorId = req.params.interlocutorId;
        const criteria = {
            where: {
                id: Buffer.from((0, uuid_1.parse)(user.id))
            }
        };
        let existingUser = null;
        if (!existingUser) {
            existingUser = await db_1.default.administrators.findUnique(criteria);
        }
        if (!existingUser) {
            existingUser = await db_1.default.teachers.findUnique(criteria);
        }
        if (!existingUser) {
            existingUser = await db_1.default.parents.findUnique(criteria);
        }
        if (!existingUser) {
            existingUser = await db_1.default.students.findUnique(criteria);
        }
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Interlocutor does not exist.`));
        }
        const messages = await db_1.default.messages.findMany({
            where: {
                OR: [
                    {
                        sender_id: Buffer.from((0, uuid_1.parse)(user.id)),
                        receiver_id: Buffer.from((0, uuid_1.parse)(interlocutorId))
                    },
                    {
                        sender_id: Buffer.from((0, uuid_1.parse)(interlocutorId)),
                        receiver_id: Buffer.from((0, uuid_1.parse)(user.id)),
                    },
                ],
            },
            orderBy: {
                date_time: 'asc',
            },
        });
        const responseData = messages.map(message => ({
            ...message,
            id: (0, uuid_1.stringify)(message.id),
            date_time: message.date_time.toISOString(),
            sender_id: (0, uuid_1.stringify)(message.sender_id),
            sender_type_id: (0, uuid_1.stringify)(message.sender_type_id),
            receiver_id: (0, uuid_1.stringify)(message.receiver_id),
            receiver_type_id: (0, uuid_1.stringify)(message.receiver_type_id),
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Messages retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving messages', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving messages. Please try again later.'));
    }
};
exports.getMessagesBetweenUsers = getMessagesBetweenUsers;
const getRecentConversations = async (req, res) => {
    try {
        const user = req.user;
        const userBuffer = Buffer.from((0, uuid_1.parse)(user.id));
        const uniquePairs = new Set();
        const filteredMessages = [];
        let pageSize = 500;
        let skip = 0;
        while (uniquePairs.size < 10) {
            const messages = await db_1.default.messages.findMany({
                where: {
                    OR: [
                        { sender_id: userBuffer },
                        { receiver_id: userBuffer }
                    ]
                },
                orderBy: {
                    date_time: 'desc'
                },
                take: pageSize,
                skip: skip
            });
            if (messages.length === 0) {
                break;
            }
            for (const message of messages) {
                const sender = (0, uuid_1.stringify)(message.sender_id);
                const receiver = (0, uuid_1.stringify)(message.receiver_id);
                const pairKey = [sender, receiver].sort().join('|');
                if (!uniquePairs.has(pairKey)) {
                    uniquePairs.add(pairKey);
                    filteredMessages.push({
                        ...message,
                        id: (0, uuid_1.stringify)(message.id),
                        date_time: message.date_time.toISOString(),
                        sender_id: sender,
                        sender_type_id: (0, uuid_1.stringify)(message.sender_type_id),
                        receiver_id: receiver,
                        receiver_type_id: (0, uuid_1.stringify)(message.receiver_type_id),
                    });
                    if (uniquePairs.size === 10) {
                        break;
                    }
                }
            }
            if (uniquePairs.size < 10) {
                skip += pageSize;
            }
            else {
                break;
            }
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(filteredMessages, 'Recent conversations retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving recent conversations:', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving recent conversations. Please try again later.'));
    }
};
exports.getRecentConversations = getRecentConversations;
