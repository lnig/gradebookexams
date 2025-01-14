"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventType = exports.updateEventType = exports.getEventType = exports.getEventTypes = exports.createEventType = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const node_buffer_1 = require("node:buffer");
const uuid_1 = require("uuid");
const createEventType = async (req, res) => {
    try {
        const name = req.body.name;
        const existingEventType = await db_1.default.event_types.findUnique({
            where: {
                name: name
            }
        });
        if (existingEventType) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Event type already exist.`));
        }
        const createdEventType = await db_1.default.event_types.create({
            data: {
                name: name
            }
        });
        const responseData = {
            ...createdEventType,
            id: (0, uuid_1.stringify)(createdEventType.id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Event type created successfully.`));
    }
    catch (err) {
        console.error('Error creating event type', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating event type. Please try again later.'));
    }
};
exports.createEventType = createEventType;
const getEventTypes = async (req, res) => {
    try {
        const eventTypes = await db_1.default.event_types.findMany();
        const responseData = eventTypes.map(eventType => ({
            ...eventType,
            id: (0, uuid_1.stringify)(eventType.id),
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Event types retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving event types', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving event types. Please try again later.'));
    }
};
exports.getEventTypes = getEventTypes;
const getEventType = async (req, res) => {
    try {
        const eventTypeId = req.params.eventTypeId;
        const existingEventType = await db_1.default.event_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId))
            }
        });
        if (!existingEventType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Event type does not exist.`));
        }
        const responseData = {
            ...existingEventType,
            id: (0, uuid_1.stringify)(existingEventType.id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Event type retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving event type', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving event type. Please try again later.'));
    }
};
exports.getEventType = getEventType;
const updateEventType = async (req, res) => {
    try {
        const eventTypeId = req.params.eventTypeId;
        const name = req.body.name;
        const existingEventType = await db_1.default.event_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId))
            }
        });
        if (!existingEventType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Event type does not exist'));
        }
        const updatedEventType = await db_1.default.event_types.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId))
            },
            data: {
                name: name
            }
        });
        const responseData = {
            ...updatedEventType,
            id: (0, uuid_1.stringify)(existingEventType.id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Event type updated successfully.`));
    }
    catch (err) {
        console.error('Error updating event type', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating event type. Please try again later.'));
    }
};
exports.updateEventType = updateEventType;
const deleteEventType = async (req, res) => {
    try {
        const eventTypeId = req.params.eventTypeId;
        const existingEventType = await db_1.default.event_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId))
            }
        });
        if (!existingEventType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Event type does not exist'));
        }
        const deletedEventType = await db_1.default.event_types.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId))
            }
        });
        const responseData = {
            ...deletedEventType,
            id: (0, uuid_1.stringify)(existingEventType.id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Event type deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting event type', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting event type. Please try again later.'));
    }
};
exports.deleteEventType = deleteEventType;
