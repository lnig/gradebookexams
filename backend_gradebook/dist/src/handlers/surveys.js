"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurveyFullDetails = exports.sendSurvey = exports.deleteSurvey = exports.updateSurvey = exports.getSurveys = exports.getSurvey = exports.createSurvey = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createSurvey = async (req, res) => {
    try {
        //survey part
        const name = req.body.name;
        const description = req.body.description;
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        //questions part
        const questions = req.body.questions;
        const questionResponsesToCreate = [];
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        startDate.setUTCHours(startHour, startMinute, 0, 0);
        endDate.setUTCHours(endHour, endMinute, 0, 0);
        const createdSurvey = await db_1.default.surveys.create({
            data: {
                name: name,
                description: description,
                start_time: startDate,
                end_time: endDate
            }
        });
        for (var question of questions) {
            const existingQuestionType = await db_1.default.questions_types.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(question.questionTypeId))
                }
            });
            if (!existingQuestionType) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Question type does not exist.`));
            }
            const createdQuestion = await db_1.default.questions.create({
                data: {
                    content: question.content,
                    survey_id: node_buffer_1.Buffer.from(createdSurvey.id),
                    question_type_id: node_buffer_1.Buffer.from(existingQuestionType.id)
                }
            });
            if (question.responses) {
                for (var response of question.responses) {
                    questionResponsesToCreate.push({
                        content: response.content,
                        question_id: node_buffer_1.Buffer.from(createdQuestion.id)
                    });
                }
            }
        }
        if (questionResponsesToCreate.length > 0)
            await db_1.default.questions_possible_responses.createMany({
                data: questionResponsesToCreate
            });
        const existingQuestions = await db_1.default.questions.findMany({
            where: {
                survey_id: createdSurvey.id
            },
            include: {
                questions_possible_responses: true
            }
        });
        const processedQuestions = existingQuestions.map(question => ({
            ...question,
            id: (0, uuid_1.stringify)(question.id),
            survey_id: (0, uuid_1.stringify)(question.survey_id),
            question_type_id: (0, uuid_1.stringify)(question.question_type_id),
            questions_possible_responses: question.questions_possible_responses.map(response => ({
                ...response,
                id: (0, uuid_1.stringify)(response.id),
                question_id: (0, uuid_1.stringify)(response.question_id),
            }))
        }));
        const responseData = {
            ...createdSurvey,
            id: (0, uuid_1.stringify)(createdSurvey.id),
            start_time: createdSurvey.start_time.toISOString(),
            end_time: createdSurvey.end_time.toISOString(),
            questions: processedQuestions
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Survey created successfully.`));
    }
    catch (err) {
        console.error('Error creating survey', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating survey. Please try again later.'));
    }
};
exports.createSurvey = createSurvey;
const getSurvey = async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        const existingSurvey = await db_1.default.surveys.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(surveyId))
            },
            include: {
                questions: {
                    include: {
                        questions_possible_responses: true
                    }
                }
            }
        });
        if (!existingSurvey) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Survey does not exist.`));
        }
        const responseData = {
            ...existingSurvey,
            id: (0, uuid_1.stringify)(existingSurvey.id),
            start_time: existingSurvey.start_time.toISOString(),
            end_time: existingSurvey.end_time.toISOString(),
            questions: existingSurvey.questions.map(question => ({
                ...question,
                id: (0, uuid_1.stringify)(question.id),
                survey_id: (0, uuid_1.stringify)(question.survey_id),
                question_type_id: (0, uuid_1.stringify)(question.question_type_id),
                questions_possible_responses: question.questions_possible_responses.map(response => ({
                    ...response,
                    id: (0, uuid_1.stringify)(response.id),
                    question_id: (0, uuid_1.stringify)(response.question_id)
                }))
            }))
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Survey retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving survey', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving survey. Please try again later.'));
    }
};
exports.getSurvey = getSurvey;
const getSurveys = async (req, res) => {
    try {
        const surveys = await db_1.default.surveys.findMany({
            include: {
                questions: {
                    include: {
                        questions_possible_responses: true
                    }
                }
            }
        });
        const responseData = surveys.map(survey => ({
            ...survey,
            id: (0, uuid_1.stringify)(survey.id),
            start_time: survey.start_time.toISOString(),
            end_time: survey.end_time.toISOString(),
            questions: survey.questions.map(question => ({
                ...question,
                id: (0, uuid_1.stringify)(question.id),
                survey_id: (0, uuid_1.stringify)(question.survey_id),
                question_type_id: (0, uuid_1.stringify)(question.question_type_id),
                questions_possible_responses: question.questions_possible_responses.map(response => ({
                    ...response,
                    id: (0, uuid_1.stringify)(response.id),
                    question_id: (0, uuid_1.stringify)(response.question_id)
                }))
            }))
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Surveys retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving surveys', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving surveys. Please try again later.'));
    }
};
exports.getSurveys = getSurveys;
const updateSurvey = async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        const name = req.body.name;
        const description = req.body.description;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const questionsToAdd = req.body.questionsToAdd;
        const questionsIdsToRemove = req.body.questionsIdsToRemove;
        const questionResponsesToCreate = [];
        const existingSurvey = await db_1.default.surveys.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(surveyId))
            }
        });
        if (!existingSurvey) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Survey does not exist.`));
        }
        if (questionsIdsToRemove && questionsIdsToRemove.length > 0)
            for (var id of questionsIdsToRemove) {
                const existingQuestion = await db_1.default.questions.findUnique({
                    where: {
                        id: node_buffer_1.Buffer.from((0, uuid_1.parse)(id)),
                        survey_id: node_buffer_1.Buffer.from(existingSurvey.id)
                    }
                });
                if (!existingQuestion) {
                    return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Question does not exist.`));
                }
            }
        const data = {
            name: name ? name : undefined,
            description: description ? description : undefined,
        };
        //If one of startDate, endDate, startTime, endTime exist then 4 of them exist
        if (startDate && endDate && startTime && endTime) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            start.setUTCHours(startHour, startMinute, 0, 0);
            end.setUTCHours(endHour, endMinute, 0, 0);
            data.start_time = start;
            data.end_time = end;
        }
        const updatedSurvey = await db_1.default.surveys.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(surveyId))
            },
            data: data
        });
        if (questionsToAdd && questionsToAdd.length > 0) {
            for (var question of questionsToAdd) {
                const existingQuestionType = await db_1.default.questions_types.findUnique({
                    where: {
                        id: node_buffer_1.Buffer.from((0, uuid_1.parse)(question.questionTypeId))
                    }
                });
                if (!existingQuestionType) {
                    return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Question type does not exist.`));
                }
                const createdQuestion = await db_1.default.questions.create({
                    data: {
                        content: question.content,
                        survey_id: node_buffer_1.Buffer.from(updatedSurvey.id),
                        question_type_id: node_buffer_1.Buffer.from(existingQuestionType.id)
                    }
                });
                if (question.responses) {
                    for (var response of question.responses) {
                        questionResponsesToCreate.push({
                            content: response.content,
                            question_id: node_buffer_1.Buffer.from(createdQuestion.id)
                        });
                    }
                }
            }
            if (questionResponsesToCreate.length > 0)
                await db_1.default.questions_possible_responses.createMany({
                    data: questionResponsesToCreate
                });
        }
        if (questionsIdsToRemove && questionsIdsToRemove.length > 0) {
            await db_1.default.questions.deleteMany({
                where: {
                    survey_id: node_buffer_1.Buffer.from(updatedSurvey.id),
                    id: {
                        in: questionsIdsToRemove.map(id => node_buffer_1.Buffer.from((0, uuid_1.parse)(id)))
                    }
                }
            });
        }
        const existingQuestions = await db_1.default.questions.findMany({
            where: {
                survey_id: existingSurvey.id
            },
            include: {
                questions_possible_responses: true
            }
        });
        const processedQuestions = existingQuestions.map(question => ({
            ...question,
            id: (0, uuid_1.stringify)(question.id),
            survey_id: (0, uuid_1.stringify)(question.survey_id),
            question_type_id: (0, uuid_1.stringify)(question.question_type_id),
            questions_possible_responses: question.questions_possible_responses.map(response => ({
                ...response,
                id: (0, uuid_1.stringify)(response.id),
                question_id: (0, uuid_1.stringify)(response.question_id),
            }))
        }));
        const responseData = {
            ...updatedSurvey,
            id: (0, uuid_1.stringify)(updatedSurvey.id),
            start_time: updatedSurvey.start_time.toISOString(),
            end_time: updatedSurvey.end_time.toISOString(),
            questions: processedQuestions
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Survey updated successfully.`));
    }
    catch (err) {
        console.error('Error updating survey', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating survey. Please try again later.'));
    }
};
exports.updateSurvey = updateSurvey;
const deleteSurvey = async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        const existingSurvey = await db_1.default.surveys.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(surveyId))
            }
        });
        if (!existingSurvey) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Survey does not exist.`));
        }
        const deletedSurvey = await db_1.default.surveys.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(surveyId))
            }
        });
        const responseData = {
            ...deletedSurvey,
            id: (0, uuid_1.stringify)(deletedSurvey.id),
            start_time: deletedSurvey.start_time.toISOString(),
            end_time: deletedSurvey.end_time.toISOString()
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Survey deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting survey', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting survey. Please try again later.'));
    }
};
exports.deleteSurvey = deleteSurvey;
const sendSurvey = async (req, res) => {
    try {
        const studentId = req.body.studentId;
        const surveyId = req.body.surveyId;
        const responses = req.body.responses;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)("Student does not exist."));
        }
        const existingSurvey = await db_1.default.surveys.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(surveyId))
            },
            include: {
                questions: {
                    include: {
                        questions_possible_responses: true
                    }
                }
            }
        });
        if (!existingSurvey) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)("Survey does not exist."));
        }
        const surveyQuestions = await db_1.default.questions.findMany({
            where: {
                survey_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(surveyId))
            }
        });
        if (surveyQuestions.length !== responses.length) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)("Survey is not complete."));
        }
        const responsesToCreate = [];
        for (const response of responses) {
            const existingQuestion = await db_1.default.questions.findUnique({
                where: {
                    id: node_buffer_1.Buffer.from((0, uuid_1.parse)(response.questionId))
                },
                include: {
                    questions_types: true
                }
            });
            if (!existingQuestion) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)("Question does not exist."));
            }
            if (existingQuestion.questions_types.name === "Closed") {
                const possibleResponses = await db_1.default.questions_possible_responses.findMany({
                    where: {
                        question_id: existingQuestion.id
                    }
                });
                let answerExist = false;
                for (const possibleResponse of possibleResponses) {
                    if (possibleResponse.content === response.content) {
                        answerExist = true;
                        break;
                    }
                }
                if (!answerExist) {
                    return res.status(400).json((0, responseInterfaces_1.createErrorResponse)("Answer does not exist."));
                }
            }
            responsesToCreate.push({
                content: response.content,
                student_id: node_buffer_1.Buffer.from(existingStudent.id),
                question_id: node_buffer_1.Buffer.from(existingQuestion.id),
            });
        }
        const payload = await db_1.default.questions_responses.createMany({
            data: responsesToCreate
        });
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(payload.count, "Survey submitted successfully."));
    }
    catch (err) {
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)("An unexpected error occurred while submitting survey. Please try again later."));
    }
};
exports.sendSurvey = sendSurvey;
const getSurveyFullDetails = async (req, res) => {
    try {
        const surveyId = req.params.surveyId;
        // Pobranie ankiety wraz z pytaniami. Do każdego pytania dołączamy możliwe odpowiedzi (questions_possible_responses)
        // oraz odpowiedzi studentów (questions_responses)
        const existingSurvey = await db_1.default.surveys.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(surveyId))
            },
            include: {
                questions: {
                    include: {
                        questions_possible_responses: true,
                        questions_responses: {
                        // Jeśli chcesz pobrać dodatkowe dane studenta, możesz rozszerzyć ten include, np. include: { students: true }
                        }
                    }
                }
            }
        });
        if (!existingSurvey) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Survey does not exist.`));
        }
        // Przetwarzamy wyniki, zamieniając pola UUID z Buffer na string oraz daty na ISO string
        const processedQuestions = existingSurvey.questions.map(question => ({
            ...question,
            id: (0, uuid_1.stringify)(question.id),
            survey_id: (0, uuid_1.stringify)(question.survey_id),
            question_type_id: (0, uuid_1.stringify)(question.question_type_id),
            questions_possible_responses: question.questions_possible_responses.map(response => ({
                ...response,
                id: (0, uuid_1.stringify)(response.id),
                question_id: (0, uuid_1.stringify)(response.question_id)
            })),
            questions_responses: question.questions_responses.map(response => ({
                ...response,
                id: (0, uuid_1.stringify)(response.id),
                student_id: (0, uuid_1.stringify)(response.student_id),
                question_id: (0, uuid_1.stringify)(response.question_id)
            }))
        }));
        const responseData = {
            ...existingSurvey,
            id: (0, uuid_1.stringify)(existingSurvey.id),
            start_time: existingSurvey.start_time.toISOString(),
            end_time: existingSurvey.end_time.toISOString(),
            questions: processedQuestions
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Survey details retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving survey details', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving survey details. Please try again later.'));
    }
};
exports.getSurveyFullDetails = getSurveyFullDetails;
