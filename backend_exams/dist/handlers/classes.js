"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassesByTeacher = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const uuidUtils_1 = require("../utils/uuidUtils");
const getClassesByTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        if (!(0, uuid_1.validate)(teacher_id)) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid teacher ID format.'));
        }
        const classes = await db_1.default.classes.findMany({
            where: { teacher_id: Buffer.from((0, uuid_1.parse)(teacher_id)) },
            select: {
                id: true,
                name: true,
                yearbook: true,
                teacher_id: true,
            },
        });
        if (!classes || classes.length === 0) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('No classes found for the given teacher.'));
        }
        const convertedClasses = (0, uuidUtils_1.convertBuffersToUUIDs)(classes);
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(convertedClasses, 'Classes retrieved successfully.'));
    }
    catch (error) {
        console.error('Error fetching classes:', error);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while fetching the classes. Please try again later.'));
    }
};
exports.getClassesByTeacher = getClassesByTeacher;
