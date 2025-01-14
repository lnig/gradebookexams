"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchoolYearById = exports.deleteSchoolYear = exports.updateSchoolYear = exports.getSchoolYears = exports.createSchoolYear = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createSchoolYear = async (req, res) => {
    try {
        const name = req.body.name;
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const existingSchoolYear = await db_1.default.school_years.findUnique({
            where: {
                name: name
            }
        });
        if (existingSchoolYear) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)('School year already exists.'));
        }
        if (startDate >= endDate) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Start date must be before end date.'));
        }
        const createdSchoolYear = await db_1.default.school_years.create({
            data: {
                name: name,
                start_date: startDate,
                end_date: endDate
            }
        });
        const responseData = {
            ...createdSchoolYear,
            id: (0, uuid_1.stringify)(createdSchoolYear.id),
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School year created successfully.`));
    }
    catch (err) {
        console.error('Error creating school year', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating school year. Please try again later.'));
    }
};
exports.createSchoolYear = createSchoolYear;
const getSchoolYears = async (req, res) => {
    try {
        const schoolYears = await db_1.default.school_years.findMany();
        const responseData = schoolYears.map(schoolYear => ({
            ...schoolYear,
            id: (0, uuid_1.stringify)(schoolYear.id),
            start_date: schoolYear.start_date.toISOString(),
            end_date: schoolYear.end_date.toISOString()
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'School years retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving school years', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving school years. Please try again later.'));
    }
};
exports.getSchoolYears = getSchoolYears;
const updateSchoolYear = async (req, res) => {
    try {
        const schoolYearId = req.params.schoolYearId;
        const name = req.body.name;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const existingSchoolYear = await db_1.default.school_years.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            }
        });
        if (!existingSchoolYear) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`School year does not exist.`));
        }
        const data = {};
        if (name)
            data.name = name;
        if (startDate)
            data.start_date = new Date(startDate);
        if (endDate)
            data.end_date = new Date(endDate);
        const updatedSchoolYear = await db_1.default.school_years.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            },
            data: data
        });
        const responseData = {
            ...updatedSchoolYear,
            id: (0, uuid_1.stringify)(updatedSchoolYear.id),
            start_date: updatedSchoolYear.start_date.toISOString(),
            end_date: updatedSchoolYear.end_date.toISOString()
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School year successfully updated.`));
    }
    catch (err) {
        console.error('Error updating school year', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating school year. Please try again later.'));
    }
};
exports.updateSchoolYear = updateSchoolYear;
const deleteSchoolYear = async (req, res) => {
    try {
        const schoolYearId = req.params.schoolYearId;
        const existingSchoolYear = await db_1.default.school_years.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            }
        });
        if (!existingSchoolYear) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`School year does not exist.`));
        }
        const deletedSchoolYear = await db_1.default.school_years.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            }
        });
        const responseData = {
            ...deletedSchoolYear,
            id: (0, uuid_1.stringify)(deletedSchoolYear.id),
            start_date: deletedSchoolYear.start_date.toISOString(),
            end_date: deletedSchoolYear.end_date.toISOString()
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School year deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting school year', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting school year. Please try again later.'));
    }
};
exports.deleteSchoolYear = deleteSchoolYear;
const getSchoolYearById = async (req, res) => {
    try {
        const schoolYearId = req.params.schoolYearId;
        if (!(0, uuid_1.parse)(schoolYearId)) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Invalid UUID format for schoolYearId.'));
        }
        const schoolYearIdBuffer = node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId));
        const schoolYearWithSemesters = await db_1.default.school_years.findUnique({
            where: {
                id: schoolYearIdBuffer
            },
            include: {
                semesters: true
            }
        });
        if (!schoolYearWithSemesters) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`School year with ID ${schoolYearId} does not exist.`));
        }
        const responseData = {
            ...schoolYearWithSemesters,
            id: (0, uuid_1.stringify)(schoolYearWithSemesters.id),
            start_date: schoolYearWithSemesters.start_date.toISOString(),
            end_date: schoolYearWithSemesters.end_date.toISOString(),
            semesters: schoolYearWithSemesters.semesters.map((semester) => ({
                ...semester,
                id: (0, uuid_1.stringify)(semester.id),
                school_year_id: (0, uuid_1.stringify)(semester.school_year_id),
                start_date: semester.start_date.toISOString(),
                end_date: semester.end_date.toISOString()
            }))
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `School year details retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving school year details', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving school year details. Please try again later.'));
    }
};
exports.getSchoolYearById = getSchoolYearById;
