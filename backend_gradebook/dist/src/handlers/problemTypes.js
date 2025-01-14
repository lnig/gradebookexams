"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProblemType = exports.updateProblemType = exports.getProblemTypes = exports.createProblemType = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createProblemType = async (req, res) => {
    try {
        const name = req.body.name;
        const existingProblemType = await db_1.default.problem_types.findUnique({
            where: {
                name: name
            }
        });
        if (existingProblemType) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Problem type already exists.`));
        }
        const createdProblemType = await db_1.default.problem_types.create({
            data: {
                name: name
            }
        });
        const responseData = {
            ...createdProblemType,
            id: (0, uuid_1.stringify)(createdProblemType.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Problem type created successfully.`));
    }
    catch (err) {
        console.error('Error creating problem type', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating problem type. Please try again later.'));
    }
};
exports.createProblemType = createProblemType;
const getProblemTypes = async (req, res) => {
    try {
        const problemTypes = await db_1.default.problem_types.findMany();
        const responseData = problemTypes.map(problemType => ({
            id: (0, uuid_1.stringify)(problemType.id),
            name: problemType.name,
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Problem types retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving problem types', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving problem types. Please try again later.'));
    }
};
exports.getProblemTypes = getProblemTypes;
const updateProblemType = async (req, res) => {
    try {
        const problemTypeId = req.params.problemTypeId;
        const name = req.body.name;
        const existingProblemType = await db_1.default.problem_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemTypeId))
            }
        });
        if (!existingProblemType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Problem type does not exist.'));
        }
        const updatedProblemType = await db_1.default.problem_types.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemTypeId))
            },
            data: {
                name: name
            }
        });
        const responseData = {
            ...updatedProblemType,
            id: (0, uuid_1.stringify)(updatedProblemType.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Problem type updated successfully.'));
    }
    catch (err) {
        console.error('Error updating problem type', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating the problem type. Please try again later.'));
    }
};
exports.updateProblemType = updateProblemType;
const deleteProblemType = async (req, res) => {
    try {
        const problemTypeId = req.params.problemTypeId;
        const existingProblemType = await db_1.default.problem_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemTypeId))
            }
        });
        if (!existingProblemType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Problem type does not exist.`));
        }
        const deletedProblemType = await db_1.default.problem_types.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemTypeId))
            }
        });
        const responseData = {
            ...deletedProblemType,
            id: (0, uuid_1.stringify)(deletedProblemType.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Problem type deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting problem type', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting problem type. Please try again later.'));
    }
};
exports.deleteProblemType = deleteProblemType;
