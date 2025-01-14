"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSemestersBySchoolYearName = exports.deleteSemester = exports.updateSemester = exports.getSemesters = exports.createSemester = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createSemester = async (req, res) => {
    try {
        const semester = req.body.semester;
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const schoolYearId = req.body.schoolYearId;
        const existingSemester = await db_1.default.semesters.findUnique({
            where: {
                semester_school_year_id: {
                    semester: semester,
                    school_year_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
                }
            }
        });
        if (existingSemester) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Semester already exists.`));
        }
        const existingSchoolYear = await db_1.default.school_years.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            }
        });
        if (!existingSchoolYear) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`School year does not exist.`));
        }
        if (startDate >= endDate) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Start date must be before end date.'));
        }
        if (startDate < existingSchoolYear.start_date || endDate > existingSchoolYear.end_date) {
            return res.status(400).json((0, responseInterfaces_1.createErrorResponse)('Semester dates must be within the school year dates.'));
        }
        const overlappingSemester = await db_1.default.semesters.findFirst({
            where: {
                school_year_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId)),
                OR: [
                    {
                        start_date: {
                            lte: endDate
                        },
                        end_date: {
                            gte: startDate
                        }
                    }
                ]
            }
        });
        if (overlappingSemester) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)('Semester dates overlap with an existing semester.'));
        }
        const createdSemester = await db_1.default.semesters.create({
            data: {
                semester: semester,
                start_date: startDate,
                end_date: endDate,
                school_year_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            }
        });
        const responseData = {
            ...createdSemester,
            id: (0, uuid_1.stringify)(createdSemester.id),
            start_date: createdSemester.start_date.toISOString(),
            end_date: createdSemester.end_date.toISOString(),
            school_year_id: (0, uuid_1.stringify)(createdSemester.school_year_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Semester created successfully.`));
    }
    catch (err) {
        console.error('Error creating semester', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating semester. Please try again later.'));
    }
};
exports.createSemester = createSemester;
const getSemesters = async (req, res) => {
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
        const semesters = await db_1.default.semesters.findMany({
            where: {
                school_year_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(schoolYearId))
            }
        });
        const responseData = semesters.map(semester => ({
            ...semester,
            id: (0, uuid_1.stringify)(semester.id),
            start_date: semester.start_date.toISOString(),
            end_date: semester.end_date.toISOString(),
            school_year_id: (0, uuid_1.stringify)(semester.school_year_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Semesters retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving semesters', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving semesters. Please try again later.'));
    }
};
exports.getSemesters = getSemesters;
const updateSemester = async (req, res) => {
    try {
        const semesterId = req.params.semesterId;
        const semester = req.body.semester;
        const startDate = req.body.startDate;
        const endDate = req.body.endDate;
        const existingSemester = await db_1.default.semesters.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(semesterId))
            }
        });
        if (!existingSemester) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Semester does not exist.`));
        }
        const data = {};
        if (semester)
            data.semester = semester;
        if (startDate)
            data.start_date = new Date(startDate);
        if (endDate)
            data.end_date = new Date(endDate);
        const updatedSchoolYear = await db_1.default.semesters.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(semesterId))
            },
            data: data
        });
        const responseData = {
            ...updatedSchoolYear,
            id: (0, uuid_1.stringify)(updatedSchoolYear.id),
            start_date: updatedSchoolYear.start_date.toISOString(),
            end_date: updatedSchoolYear.end_date.toISOString(),
            school_year_id: (0, uuid_1.stringify)(updatedSchoolYear.school_year_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Semester successfully updated.`));
    }
    catch (err) {
        console.error('Error updating semester', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating semester. Please try again later.'));
    }
};
exports.updateSemester = updateSemester;
const deleteSemester = async (req, res) => {
    try {
        const semesterId = req.params.semesterId;
        const existingSemester = await db_1.default.semesters.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(semesterId))
            }
        });
        if (!existingSemester) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Semester does not exist.`));
        }
        const deletedSemester = await db_1.default.semesters.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(semesterId))
            }
        });
        const responseData = {
            ...deletedSemester,
            id: (0, uuid_1.stringify)(deletedSemester.id),
            start_date: deletedSemester.start_date.toISOString(),
            end_date: deletedSemester.end_date.toISOString(),
            school_year_id: (0, uuid_1.stringify)(deletedSemester.school_year_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Semester deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting semester', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting semester. Please try again later.'));
    }
};
exports.deleteSemester = deleteSemester;
const getSemestersBySchoolYearName = async (req, res) => {
    try {
        const currentYear = new Date().getUTCFullYear();
        const currentMonth = new Date().getUTCMonth();
        let year = null;
        if (currentMonth < 7) {
            year = currentYear - 1;
        }
        else {
            year = currentYear;
        }
        const existingSchoolYear = await db_1.default.school_years.findUnique({
            where: {
                name: `${year}/${year + 1}`
            }
        });
        if (!existingSchoolYear) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`School year named does not exist.`));
        }
        const semestersList = await db_1.default.semesters.findMany({
            where: {
                school_year_id: existingSchoolYear.id
            }
        });
        const responseData = semestersList.map((semester) => ({
            ...semester,
            id: (0, uuid_1.stringify)(semester.id),
            name: semester.semester,
            start_date: semester.start_date.toISOString(),
            end_date: semester.end_date.toISOString(),
            school_year_id: (0, uuid_1.stringify)(semester.school_year_id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Semesters for the school year have been successfully retrieved.`));
    }
    catch (err) {
        console.error('Error retrieving semesters by school year name', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving semesters. Please try again later.'));
    }
};
exports.getSemestersBySchoolYearName = getSemestersBySchoolYearName;
