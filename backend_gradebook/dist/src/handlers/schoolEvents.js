"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchoolEvent = exports.updateSchoolEvent = exports.getSchoolEvent = exports.getSchoolEvents = exports.createSchoolEvent = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const node_buffer_1 = require("node:buffer");
const uuid_1 = require("uuid");
const createSchoolEvent = async (req, res) => {
    try {
        const name = req.body.name;
        const location = req.body.location;
        const description = req.body.description;
        const date = new Date(req.body.date);
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const eventTypeId = req.body.eventTypeId;
        const existingEventType = await db_1.default.event_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId))
            }
        });
        if (!existingEventType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Event type does not exist.`));
        }
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startDateTime = new Date(req.body.date);
        startDateTime.setUTCHours(startHour, startMinute, 0, 0);
        const endDateTime = new Date(req.body.date);
        endDateTime.setUTCHours(endHour, endMinute, 0, 0);
        const createdSchoolEvent = await db_1.default.school_events.create({
            data: {
                name: name,
                location: location,
                description: description,
                date: date,
                start_time: startDateTime,
                end_time: endDateTime,
                event_type_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId)),
            }
        });
        const responseData = {
            ...createdSchoolEvent,
            id: (0, uuid_1.stringify)(createdSchoolEvent.id),
            date: createdSchoolEvent.date.toISOString(),
            start_time: createdSchoolEvent.start_time.toISOString(),
            end_time: createdSchoolEvent.end_time.toISOString(),
            event_type_id: (0, uuid_1.stringify)(createdSchoolEvent.event_type_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School event created successfully.`));
    }
    catch (err) {
        console.error('Error creating school event', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating school event. Please try again later.'));
    }
};
exports.createSchoolEvent = createSchoolEvent;
const getSchoolEvents = async (req, res) => {
    try {
        const schoolEvents = await db_1.default.school_events.findMany();
        const responseData = schoolEvents.map(schoolEvent => ({
            ...schoolEvent,
            id: (0, uuid_1.stringify)(schoolEvent.id),
            date: schoolEvent.date.toISOString(),
            start_time: schoolEvent.start_time.toISOString(),
            end_time: schoolEvent.end_time.toISOString(),
            event_type_id: (0, uuid_1.stringify)(schoolEvent.event_type_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School events retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving school events', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving school events. Please try again later.'));
    }
};
exports.getSchoolEvents = getSchoolEvents;
const getSchoolEvent = async (req, res) => {
    try {
        const schoolEventId = req.params.schoolEventId;
        const existingSchoolEvent = await db_1.default.school_events.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolEventId))
            }
        });
        if (!existingSchoolEvent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`School event does not exist.`));
        }
        const responseData = {
            ...existingSchoolEvent,
            id: (0, uuid_1.stringify)(existingSchoolEvent.id),
            date: existingSchoolEvent.date.toISOString(),
            start_time: existingSchoolEvent.start_time.toISOString(),
            end_time: existingSchoolEvent.end_time.toISOString(),
            event_type_id: (0, uuid_1.stringify)(existingSchoolEvent.event_type_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School event retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving school event', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving school event. Please try again later.'));
    }
};
exports.getSchoolEvent = getSchoolEvent;
const updateSchoolEvent = async (req, res) => {
    try {
        const schoolEventId = req.params.schoolEventId;
        const name = req.body.name;
        const location = req.body.location;
        const description = req.body.description;
        const date = req.body.date ? new Date(req.body.date) : undefined;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const eventTypeId = req.body.eventTypeId;
        const existingSchoolEvent = await db_1.default.school_events.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolEventId))
            }
        });
        if (!existingSchoolEvent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('School event does not exist'));
        }
        const data = {};
        if (name)
            data.name = name;
        if (location)
            data.location = location;
        if (description)
            data.description = description;
        if (date)
            data.date = date;
        if (startTime) {
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const startDateTime = new Date(existingSchoolEvent.date);
            startDateTime.setUTCHours(startHour, startMinute, 0, 0);
            data.start_time = startDateTime;
        }
        if (endTime) {
            const [endHour, endMinute] = endTime.split(':').map(Number);
            const endDateTime = new Date(existingSchoolEvent.date);
            endDateTime.setUTCHours(endHour, endMinute, 0, 0);
            data.end_time = endDateTime;
        }
        if (eventTypeId) {
            const existingEventType = await db_1.default.event_types.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId))
                }
            });
            if (!existingEventType) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Event type does not exist.`));
            }
            data.event_type_id = node_buffer_1.Buffer.from((0, uuid_1.parse)(eventTypeId));
        }
        const updatedSchoolEvent = await db_1.default.school_events.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolEventId))
            },
            data: data
        });
        const responseData = {
            ...updatedSchoolEvent,
            id: (0, uuid_1.stringify)(existingSchoolEvent.id),
            date: updatedSchoolEvent.date.toISOString(),
            start_time: updatedSchoolEvent.start_time.toISOString(),
            end_time: updatedSchoolEvent.end_time.toISOString(),
            event_type_id: (0, uuid_1.stringify)(updatedSchoolEvent.event_type_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School event updated successfully.`));
    }
    catch (err) {
        console.error('Error updating school event', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating school event. Please try again later.'));
    }
};
exports.updateSchoolEvent = updateSchoolEvent;
const deleteSchoolEvent = async (req, res) => {
    try {
        const schoolEventId = req.params.schoolEventId;
        const existingSchoolEvent = await db_1.default.school_events.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolEventId))
            }
        });
        if (!existingSchoolEvent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('School event does not exist'));
        }
        const deletedSchoolEvent = await db_1.default.school_events.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolEventId))
            }
        });
        const responseData = {
            ...deletedSchoolEvent,
            id: (0, uuid_1.stringify)(existingSchoolEvent.id),
            date: existingSchoolEvent.date.toISOString(),
            start_time: existingSchoolEvent.start_time.toISOString(),
            end_time: existingSchoolEvent.end_time.toISOString(),
            event_type_id: (0, uuid_1.stringify)(existingSchoolEvent.event_type_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School event deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting school event', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting school event. Please try again later.'));
    }
};
exports.deleteSchoolEvent = deleteSchoolEvent;
