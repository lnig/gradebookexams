"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const updateQuestion = async (req, res) => {
    try {
        const questionId = req.params.surveyId;
        const content = req.body.content;
        const existingQuestion = await db_1.default.questions.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(questionId))
            }
        });
        if (!existingQuestion) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Question does not exist.`));
        }
        const updatedQuestion = await db_1.default.questions.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(questionId))
            },
            data: {
                content: content
            }
        });
        const responseData = {
            ...updatedQuestion,
            id: (0, uuid_1.stringify)(updatedQuestion.id),
            survey_id: (0, uuid_1.stringify)(updatedQuestion.survey_id),
            question_type_id: (0, uuid_1.stringify)(updatedQuestion.question_type_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Question updated successfully.`));
    }
    catch (err) {
        console.error('Error updating question', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating question. Please try again later.'));
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const existingQuestion = await db_1.default.questions.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(questionId))
            }
        });
        if (!existingQuestion) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Question does not exist.`));
        }
        const deletedQuestion = await db_1.default.questions.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(questionId))
            },
            include: {
                questions_possible_responses: true
            }
        });
        const responseData = {
            ...deletedQuestion,
            id: (0, uuid_1.stringify)(deletedQuestion.id),
            survey_id: (0, uuid_1.stringify)(deletedQuestion.survey_id),
            question_type_id: (0, uuid_1.stringify)(deletedQuestion.question_type_id),
            survey_possible_responses: deletedQuestion.questions_possible_responses.map(response => ({
                ...response,
                id: (0, uuid_1.stringify)(response.id),
                question_id: (0, uuid_1.stringify)(response.question_id)
            }))
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Question deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting question', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting question. Please try again later.'));
    }
};
exports.deleteQuestion = deleteQuestion;
