"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubject = exports.updateSubject = exports.getSubjects = exports.createSubject = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createSubject = async (req, res) => {
    try {
        const name = req.body.name;
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                name: name
            }
        });
        if (existingSubject) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Subject already exists.`));
        }
        const createdSubject = await db_1.default.subjects.create({
            data: {
                name: name
            }
        });
        const responseData = {
            ...createdSubject,
            id: (0, uuid_1.stringify)(createdSubject.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Subject created successfully.`));
    }
    catch (err) {
        console.error('Error creating subject', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating subject. Please try again later.'));
    }
};
exports.createSubject = createSubject;
const getSubjects = async (req, res) => {
    try {
        const subjects = await db_1.default.subjects.findMany();
        const responeData = subjects.map(subject => ({
            ...subject,
            id: (0, uuid_1.stringify)(subject.id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responeData, 'Subjects retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving subjects', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving subjects. Please try again later.'));
    }
};
exports.getSubjects = getSubjects;
const updateSubject = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const name = req.body.name;
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        if (!existingSubject) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Subject does not exist.`));
        }
        const updatedSubject = await db_1.default.subjects.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            },
            data: {
                name: name
            }
        });
        const responseData = {
            ...updatedSubject,
            id: (0, uuid_1.stringify)(updatedSubject.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Subject successfully updated.`));
    }
    catch (err) {
        console.error('Error updating subject', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating subject. Please try again later.'));
    }
};
exports.updateSubject = updateSubject;
const deleteSubject = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const existingSubject = await db_1.default.subjects.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        if (!existingSubject) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Subject does not exist.`));
        }
        const deletedSubject = await db_1.default.subjects.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(subjectId))
            }
        });
        const responseData = {
            ...deletedSubject,
            id: (0, uuid_1.stringify)(deletedSubject.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Subject deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting subject', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting subject. Please try again later.'));
    }
};
exports.deleteSubject = deleteSubject;
