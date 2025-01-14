"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../src/db"));
const node_test_1 = __importStar(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const requestHelpers_1 = require("../../src/utils/requestHelpers");
const testData_1 = require("../../src/utils/testData");
(0, node_test_1.suite)('surveysRouter', { only: true }, () => {
    (0, node_test_1.afterEach)(async () => {
        await db_1.default.questions_possible_responses.deleteMany();
        await db_1.default.questions.deleteMany();
        await db_1.default.questions_types.deleteMany();
        await db_1.default.surveys.deleteMany();
    });
    (0, node_test_1.default)('CreateSurvey() - success', { only: true }, async () => {
        const createQuestionTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createQuestionTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType2);
        node_assert_1.default.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createSurveyResponse = await (0, requestHelpers_1.sendPostRequest)('/survey', {
            ...testData_1.survey1,
            questions: [
                {
                    content: testData_1.closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: testData_1.closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: testData_1.openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        const [startHour, startMinute] = testData_1.survey1.startTime.split(':').map(Number);
        const [endHour, endMinute] = testData_1.survey1.endTime.split(':').map(Number);
        const startTime = new Date(testData_1.survey1.startDate);
        startTime.setUTCHours(startHour, startMinute, 0, 0);
        const endTime = new Date(testData_1.survey1.endDate);
        endTime.setUTCHours(endHour, endMinute, 0, 0);
        node_assert_1.default.strictEqual(createSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');
        node_assert_1.default.strictEqual(createSurveyResponse.body.data.start_time, startTime.toISOString(), `Expected the start time to be "${startTime.toISOString()}".`);
        node_assert_1.default.strictEqual(createSurveyResponse.body.data.end_time, endTime.toISOString(), `Expected the end time to be "${endTime.toISOString()}".`);
        node_assert_1.default.strictEqual(createSurveyResponse.body.data.questions[0].survey_id, createSurveyResponse.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        node_assert_1.default.strictEqual(createSurveyResponse.body.data.questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        node_assert_1.default.strictEqual(createSurveyResponse.body.data.questions[0].questions_possible_responses[0].content, testData_1.closedQuestionResponse1.content, `Expected the content to be "${testData_1.closedQuestionResponse1.content}".`);
        node_assert_1.default.strictEqual(createSurveyResponse.body.data.questions.length, 2, `Expected the number of surveys questions to be 2`);
    });
    (0, node_test_1.default)('CreateSurvey() - validation error - questions is not an empty array', { only: true }, async () => {
        const createSurveyResponse = await (0, requestHelpers_1.sendPostRequest)('/survey', {
            name: testData_1.emptyString,
            description: testData_1.emptyString,
            startDate: testData_1.emptyString,
            endDate: testData_1.emptyString,
            startTime: testData_1.emptyString,
            endTime: testData_1.emptyString,
            questions: [
                {
                    content: testData_1.emptyString,
                    questionTypeId: testData_1.emptyString,
                    responses: [
                        {
                            content: testData_1.emptyString
                        }
                    ]
                },
                {
                    content: testData_1.emptyString,
                    questionTypeId: testData_1.emptyString
                }
            ]
        });
        node_assert_1.default.strictEqual(createSurveyResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createSurveyResponse.body.errors.length, 11, 'Expected the number of validation errors to be 11.');
    });
    (0, node_test_1.default)('CreateSurvey() - validation error - questions array does not exist', { only: true }, async () => {
        const createSurveyResponse = await (0, requestHelpers_1.sendPostRequest)('/survey', {
            name: testData_1.emptyString,
            description: testData_1.emptyString,
            startDate: testData_1.emptyString,
            endDate: testData_1.emptyString,
            startTime: testData_1.emptyString,
            endTime: testData_1.emptyString,
        });
        node_assert_1.default.strictEqual(createSurveyResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(createSurveyResponse.body.errors.length, 7, 'Expected the number of validation errors to be 7.');
    });
    (0, node_test_1.default)('getSurvey() - success', { only: true }, async () => {
        const createQuestionTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createQuestionTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType2);
        node_assert_1.default.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createSurveyResponse = await (0, requestHelpers_1.sendPostRequest)('/survey', {
            ...testData_1.survey1,
            questions: [
                {
                    content: testData_1.closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: testData_1.closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: testData_1.openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        const [startHour, startMinute] = testData_1.survey1.startTime.split(':').map(Number);
        const [endHour, endMinute] = testData_1.survey1.endTime.split(':').map(Number);
        const startTime = new Date(testData_1.survey1.startDate);
        startTime.setUTCHours(startHour, startMinute, 0, 0);
        const endTime = new Date(testData_1.survey1.endDate);
        endTime.setUTCHours(endHour, endMinute, 0, 0);
        node_assert_1.default.strictEqual(createSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');
        const getSurveyResponse = await (0, requestHelpers_1.sendGetRequest)(`/survey/${createSurveyResponse.body.data.id}`);
        node_assert_1.default.strictEqual(getSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey retrieval.');
        node_assert_1.default.strictEqual(getSurveyResponse.body.data.start_time, startTime.toISOString(), `Expected the start time to be "${startTime.toISOString()}".`);
        node_assert_1.default.strictEqual(getSurveyResponse.body.data.end_time, endTime.toISOString(), `Expected the end time to be "${endTime.toISOString()}".`);
        node_assert_1.default.strictEqual(getSurveyResponse.body.data.questions[0].survey_id, createSurveyResponse.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        node_assert_1.default.strictEqual(getSurveyResponse.body.data.questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        node_assert_1.default.strictEqual(getSurveyResponse.body.data.questions[0].questions_possible_responses[0].content, testData_1.closedQuestionResponse1.content, `Expected the content to be "${testData_1.closedQuestionResponse1.content}".`);
        node_assert_1.default.strictEqual(getSurveyResponse.body.data.questions.length, 2, `Expected the number of surveys questions to be 2`);
    });
    (0, node_test_1.default)('getSurvey() - validation error', { only: true }, async () => {
        const getSurveyResponse = await (0, requestHelpers_1.sendGetRequest)(`/survey/${testData_1.invalidIdUrl}`);
        node_assert_1.default.strictEqual(getSurveyResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(getSurveyResponse.body.errors.length, 1, 'Expected the number of validation errors to be 1.');
    });
    (0, node_test_1.default)('getSurvey() - survey does not exist', { only: true }, async () => {
        const getSurveyResponse = await (0, requestHelpers_1.sendGetRequest)(`/survey/${testData_1.nonExistentId}`);
        node_assert_1.default.strictEqual(getSurveyResponse.statusCode, 404, 'Expected the status code to be 404 for a event type that does not exist.');
    });
    (0, node_test_1.default)('getSurveys() - success', { only: true }, async () => {
        const createQuestionTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createQuestionTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType2);
        node_assert_1.default.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createSurveyResponse1 = await (0, requestHelpers_1.sendPostRequest)('/survey', {
            ...testData_1.survey1,
            questions: [
                {
                    content: testData_1.closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: testData_1.closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: testData_1.openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        const [startHour1, startMinute1] = testData_1.survey1.startTime.split(':').map(Number);
        const [endHour1, endMinute1] = testData_1.survey1.endTime.split(':').map(Number);
        const startTime1 = new Date(testData_1.survey1.startDate);
        startTime1.setUTCHours(startHour1, startMinute1, 0, 0);
        const endTime1 = new Date(testData_1.survey1.endDate);
        endTime1.setUTCHours(endHour1, endMinute1, 0, 0);
        node_assert_1.default.strictEqual(createSurveyResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');
        const createSurveyResponse2 = await (0, requestHelpers_1.sendPostRequest)('/survey', {
            ...testData_1.survey2,
            questions: [
                {
                    content: testData_1.closedQuestion2.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: testData_1.closedQuestionResponse2.content
                        }
                    ]
                },
                {
                    content: testData_1.openQuestion2.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        const [startHour2, startMinute2] = testData_1.survey2.startTime.split(':').map(Number);
        const [endHour2, endMinute2] = testData_1.survey2.endTime.split(':').map(Number);
        const startTime2 = new Date(testData_1.survey2.startDate);
        startTime2.setUTCHours(startHour2, startMinute2, 0, 0);
        const endTime2 = new Date(testData_1.survey2.endDate);
        endTime2.setUTCHours(endHour2, endMinute2, 0, 0);
        node_assert_1.default.strictEqual(createSurveyResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');
        const getSurveysResponse = await (0, requestHelpers_1.sendGetRequest)(`/survey`);
        node_assert_1.default.strictEqual(getSurveysResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey retrieval.');
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[0].start_time, startTime1.toISOString(), `Expected the start time to be "${startTime1.toISOString()}".`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[0].end_time, endTime1.toISOString(), `Expected the end time to be "${endTime1.toISOString()}".`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[0].questions[0].survey_id, createSurveyResponse1.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[0].questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[0].questions[0].questions_possible_responses[0].content, testData_1.closedQuestionResponse1.content, `Expected the content to be "${testData_1.closedQuestionResponse1.content}".`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[0].questions.length, 2, `Expected the number of surveys questions to be 2`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[1].start_time, startTime2.toISOString(), `Expected the start time to be "${startTime2.toISOString()}".`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[1].end_time, endTime2.toISOString(), `Expected the end time to be "${endTime2.toISOString()}".`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[1].questions[0].survey_id, createSurveyResponse2.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[1].questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[1].questions[0].questions_possible_responses[0].content, testData_1.closedQuestionResponse2.content, `Expected the content to be "${testData_1.closedQuestionResponse2.content}".`);
        node_assert_1.default.strictEqual(getSurveysResponse.body.data[1].questions.length, 2, `Expected the number of surveys questions to be 2`);
    });
    (0, node_test_1.default)('updateSurvey() - success', { only: true }, async () => {
        const createQuestionTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createQuestionTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType2);
        node_assert_1.default.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createSurveyResponse = await (0, requestHelpers_1.sendPostRequest)('/survey', {
            ...testData_1.survey1,
            questions: [
                {
                    content: testData_1.closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: testData_1.closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: testData_1.openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        node_assert_1.default.strictEqual(createSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');
        const updateSurveyResponse = await (0, requestHelpers_1.sendPatchRequest)(`/survey/${createSurveyResponse.body.data.id}`, {
            ...testData_1.survey2,
            questionsToAdd: [
                {
                    content: testData_1.closedQuestion2.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: testData_1.closedQuestionResponse2.content
                        }
                    ]
                },
                {
                    content: testData_1.openQuestion2.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ],
            questionsIdsToRemove: [
                ...createSurveyResponse.body.data.questions.map((question) => question.id)
            ]
        });
        const [startHour2, startMinute2] = testData_1.survey2.startTime.split(':').map(Number);
        const [endHour2, endMinute2] = testData_1.survey2.endTime.split(':').map(Number);
        const startTime2 = new Date(testData_1.survey2.startDate);
        startTime2.setUTCHours(startHour2, startMinute2, 0, 0);
        const endTime2 = new Date(testData_1.survey2.endDate);
        endTime2.setUTCHours(endHour2, endMinute2, 0, 0);
        node_assert_1.default.strictEqual(updateSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey update.');
        node_assert_1.default.strictEqual(updateSurveyResponse.body.data.start_time, startTime2.toISOString(), `Expected the start time to be "${startTime2.toISOString()}".`);
        node_assert_1.default.strictEqual(updateSurveyResponse.body.data.end_time, endTime2.toISOString(), `Expected the end time to be "${endTime2.toISOString()}".`);
        node_assert_1.default.strictEqual(updateSurveyResponse.body.data.questions[0].survey_id, createSurveyResponse.body.data.id, `Expected question's survey's ID to match the created survey ID.`);
        node_assert_1.default.strictEqual(updateSurveyResponse.body.data.questions[0].question_type_id, createQuestionTypeResponse1.body.data.id, `Expected question's type ID to match the question type ID.`);
        node_assert_1.default.strictEqual(updateSurveyResponse.body.data.questions[0].questions_possible_responses[0].content, testData_1.closedQuestionResponse2.content, `Expected the content to be "${testData_1.closedQuestionResponse2.content}".`);
        node_assert_1.default.strictEqual(updateSurveyResponse.body.data.questions.length, 2, `Expected the number of surveys questions to be 2`);
    });
    (0, node_test_1.default)('updateSurvey() - validation error', { only: true }, async () => {
        const updateSurveyResponse = await (0, requestHelpers_1.sendPatchRequest)(`/survey/${testData_1.invalidIdUrl}`, {
            name: testData_1.emptyString,
            description: testData_1.emptyString,
            startDate: testData_1.emptyString,
            endDate: testData_1.emptyString,
            startTime: testData_1.emptyString,
            endTime: testData_1.emptyString,
            questionsToAdd: [
                {
                    content: testData_1.emptyString,
                    questionTypeId: testData_1.emptyString,
                    responses: [
                        {
                            content: testData_1.emptyString
                        }
                    ]
                },
                {
                    content: testData_1.emptyString,
                    questionTypeId: testData_1.emptyString
                }
            ],
            questionsIdsToRemove: [testData_1.emptyString]
        });
        node_assert_1.default.strictEqual(updateSurveyResponse.statusCode, 400, 'Expected the status code to be 400 for a validation error.');
        node_assert_1.default.strictEqual(updateSurveyResponse.body.errors.length, 7, 'Expected the number of validation errors to be 7.');
    });
    (0, node_test_1.default)('updateSurvey() - survey does not exist', { only: true }, async () => {
        const createQuestionTypeResponse1 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType1);
        node_assert_1.default.strictEqual(createQuestionTypeResponse1.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createQuestionTypeResponse2 = await (0, requestHelpers_1.sendPostRequest)('/question-type', testData_1.questionType2);
        node_assert_1.default.strictEqual(createQuestionTypeResponse2.statusCode, 200, 'Expected the status code to be 200 for a successful question type creation.');
        const createSurveyResponse = await (0, requestHelpers_1.sendPostRequest)('/survey', {
            ...testData_1.survey1,
            questions: [
                {
                    content: testData_1.closedQuestion1.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: testData_1.closedQuestionResponse1.content
                        }
                    ]
                },
                {
                    content: testData_1.openQuestion1.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ]
        });
        node_assert_1.default.strictEqual(createSurveyResponse.statusCode, 200, 'Expected the status code to be 200 for a successful survey creation.');
        const updateSurveyResponse = await (0, requestHelpers_1.sendPatchRequest)(`/survey/${testData_1.nonExistentId}`, {
            ...testData_1.survey2,
            questionsToAdd: [
                {
                    content: testData_1.closedQuestion2.content,
                    questionTypeId: createQuestionTypeResponse1.body.data.id,
                    responses: [
                        {
                            content: testData_1.closedQuestionResponse2.content
                        }
                    ]
                },
                {
                    content: testData_1.openQuestion2.content,
                    questionTypeId: createQuestionTypeResponse2.body.data.id
                }
            ],
            questionsIdsToRemove: [
                ...createSurveyResponse.body.data.questions.map((question) => question.id)
            ]
        });
        node_assert_1.default.strictEqual(updateSurveyResponse.statusCode, 404, 'Expected the status code to be 404 for a survey that does not exist.');
    });
});
