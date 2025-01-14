"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestionType = exports.getQuestionTypes = exports.createQuestionType = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createQuestionType = async (req, res) => {
    try {
        const name = req.body.name;
        const existingType = await db_1.default.questions_types.findUnique({
            where: {
                name: name
            }
        });
        if (existingType) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Question type already exists.`));
        }
        const createdType = await db_1.default.questions_types.create({
            data: {
                name: name
            }
        });
        const responseData = {
            ...createdType,
            id: (0, uuid_1.stringify)(createdType.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Question type created successfully.`));
    }
    catch (err) {
        console.error('Error creating question type', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating question type. Please try again later.'));
    }
};
exports.createQuestionType = createQuestionType;
const getQuestionTypes = async (req, res) => {
    try {
        const questionTypes = await db_1.default.questions_types.findMany();
        const responseData = questionTypes.map(type => ({
            id: (0, uuid_1.stringify)(type.id),
            name: type.name
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Question types retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving question types', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving question types. Please try again later.'));
    }
};
exports.getQuestionTypes = getQuestionTypes;
const deleteQuestionType = async (req, res) => {
    try {
        const questionTypeId = req.params.questionTypeId;
        const existingType = await db_1.default.questions_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(questionTypeId))
            }
        });
        if (!existingType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Question type does not exist.`));
        }
        const deletedQuestionType = await db_1.default.questions_types.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(questionTypeId))
            }
        });
        const responseData = {
            ...deletedQuestionType,
            id: (0, uuid_1.stringify)(deletedQuestionType.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Question type deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting question type', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting question type. Please try again later.'));
    }
};
exports.deleteQuestionType = deleteQuestionType;
