"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUpdate = exports.updateUpdate = exports.getUpdates = exports.createUpdate = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createUpdate = async (req, res) => {
    try {
        const description = req.body.description;
        const version = req.body.version;
        const existingUpdate = await db_1.default.updates.findUnique({
            where: {
                version: version
            }
        });
        if (existingUpdate) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Update already exists.`));
        }
        const createdUpdate = await db_1.default.updates.create({
            data: {
                description: description,
                version: version,
                release_time: new Date()
            }
        });
        const responseData = {
            ...createdUpdate,
            id: (0, uuid_1.stringify)(createdUpdate.id),
            release_time: createdUpdate.release_time.toISOString()
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Update created successfully.`));
    }
    catch (err) {
        console.error('Error creating update', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating update. Please try again later.'));
    }
};
exports.createUpdate = createUpdate;
const getUpdates = async (req, res) => {
    try {
        const updates = await db_1.default.updates.findMany();
        const responseData = updates.map(status => ({
            id: (0, uuid_1.stringify)(status.id),
            release_time: status.release_time.toISOString()
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Updates retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving updates', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving updates. Please try again later.'));
    }
};
exports.getUpdates = getUpdates;
const updateUpdate = async (req, res) => {
    try {
        const updateId = req.params.updateId;
        const description = req.body.description;
        const version = req.body.version;
        const existingUpdate = await db_1.default.updates.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(updateId))
            }
        });
        if (!existingUpdate) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Update does not exist.`));
        }
        const updatedUpdate = await db_1.default.updates.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(updateId))
            },
            data: {
                description: description,
                version: version
            }
        });
        const responseData = {
            ...updatedUpdate,
            id: (0, uuid_1.stringify)(updatedUpdate.id),
            release_time: updatedUpdate.release_time.toISOString()
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Update updated successfully.`));
    }
    catch (err) {
        console.error('Error updating update', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating update. Please try again later.'));
    }
};
exports.updateUpdate = updateUpdate;
const deleteUpdate = async (req, res) => {
    try {
        const updateId = req.params.updateId;
        const existingUpdate = await db_1.default.updates.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(updateId))
            }
        });
        if (!existingUpdate) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Update does not exist.`));
        }
        const deletedUpdate = await db_1.default.updates.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(updateId))
            }
        });
        const responseData = {
            ...deletedUpdate,
            id: (0, uuid_1.stringify)(deletedUpdate.id),
            release_time: deletedUpdate.release_time.toISOString()
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Update deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting update', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting update. Please try again later.'));
    }
};
exports.deleteUpdate = deleteUpdate;
