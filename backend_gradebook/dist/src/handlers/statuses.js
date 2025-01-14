"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStatus = exports.updateStatus = exports.getStatuses = exports.createStatus = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createStatus = async (req, res) => {
    try {
        const name = req.body.name;
        const existingStatus = await db_1.default.statuses.findUnique({
            where: {
                name: name
            }
        });
        if (existingStatus) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Status already exists.`));
        }
        const createdStatus = await db_1.default.statuses.create({
            data: {
                name: name
            }
        });
        const responseData = {
            ...createdStatus,
            id: (0, uuid_1.stringify)(createdStatus.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Status created successfully.`));
    }
    catch (err) {
        console.error('Error creating status', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating status. Please try again later.'));
    }
};
exports.createStatus = createStatus;
const getStatuses = async (req, res) => {
    try {
        const statuses = await db_1.default.statuses.findMany();
        const responseData = statuses.map(status => ({
            id: (0, uuid_1.stringify)(status.id),
            name: status.name
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Statuses retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving statuses', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving statuses. Please try again later.'));
    }
};
exports.getStatuses = getStatuses;
const updateStatus = async (req, res) => {
    try {
        const statusId = req.params.status;
        const name = req.body.name;
        const existingStatus = await db_1.default.statuses.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(statusId))
            }
        });
        if (!existingStatus) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Status does not exist.'));
        }
        const updatedStatus = await db_1.default.statuses.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(statusId))
            },
            data: {
                name: name
            }
        });
        const responseData = {
            ...updatedStatus,
            id: (0, uuid_1.stringify)(updatedStatus.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Status updated successfully.'));
    }
    catch (err) {
        console.error('Error updating status', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating the status. Please try again later.'));
    }
};
exports.updateStatus = updateStatus;
const deleteStatus = async (req, res) => {
    try {
        const statusId = req.params.statusId;
        const existingStatus = await db_1.default.statuses.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(statusId))
            }
        });
        if (!existingStatus) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Status does not exist.`));
        }
        const deletedStatus = await db_1.default.statuses.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(statusId))
            }
        });
        const responseData = {
            ...deletedStatus,
            id: (0, uuid_1.stringify)(deletedStatus.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Status deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting status', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting status. Please try again later.'));
    }
};
exports.deleteStatus = deleteStatus;
