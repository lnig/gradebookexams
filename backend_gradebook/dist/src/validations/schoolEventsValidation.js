"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateSchoolEvent = exports.validateSchoolEventId = exports.validateCreateSchoolEvents = void 0;
const express_validator_1 = require("express-validator");
const validationHelpers_1 = require("../utils/validationHelpers");
const atLeastOneFieldValidation = () => {
    return (0, express_validator_1.body)().custom((value, { req }) => {
        const name = req.body.name;
        const location = req.body.location;
        const description = req.body.description;
        const date = req.body.date ? new Date(req.body.date) : undefined;
        const startTime = req.body.startTime ? new Date(req.body.startTime) : undefined;
        const endTime = req.body.endTime ? new Date(req.body.endTime) : undefined;
        const eventTypeId = req.body.eventTypeId;
        if (!name && !location && !description && !date && !startTime && !endTime && !eventTypeId)
            throw new Error('At least one field must be provided.');
        if (name)
            (0, validationHelpers_1.createNotEmptyValidation)('name').run(req);
        if (location)
            (0, validationHelpers_1.createNotEmptyValidation)('location').run(req);
        if (description)
            (0, validationHelpers_1.createNotEmptyValidation)('description').run(req);
        if (date)
            (0, validationHelpers_1.createDateValidation)('date').run(req);
        if (startTime)
            (0, validationHelpers_1.createTimeValidation)('startTime').run(req);
        if (endTime)
            (0, validationHelpers_1.createTimeValidation)('endTime').run(req);
        if (eventTypeId)
            (0, validationHelpers_1.createNotEmptyValidation)('eventTypeId').run(req);
        const result = (0, express_validator_1.validationResult)(req);
        if (!result.isEmpty())
            return false;
        return true;
    });
};
const validateCreateSchoolEvents = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('name'),
    (0, validationHelpers_1.createNotEmptyValidation)('location'),
    (0, validationHelpers_1.createNotEmptyValidation)('description'),
    (0, validationHelpers_1.createDateValidation)('date'),
    (0, validationHelpers_1.createTimeValidation)('startTime'),
    (0, validationHelpers_1.createTimeValidation)('endTime'),
    (0, validationHelpers_1.createNotEmptyValidation)('eventTypeId'),
];
exports.validateCreateSchoolEvents = validateCreateSchoolEvents;
const validateSchoolEventId = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('schoolEventId', 'param'),
];
exports.validateSchoolEventId = validateSchoolEventId;
const validateUpdateSchoolEvent = () => [
    (0, validationHelpers_1.createNotEmptyValidation)('schoolEventId', 'param'),
    atLeastOneFieldValidation()
];
exports.validateUpdateSchoolEvent = validateUpdateSchoolEvent;
