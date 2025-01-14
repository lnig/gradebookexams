"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProblem = exports.updateProblem = exports.getProblemsByType = exports.getProblems = exports.createProblem = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const userTypes_1 = require("../enums/userTypes");
const statuses_1 = require("../enums/statuses");
const createProblem = async (req, res) => {
    try {
        const description = req.body.description;
        const problemTypeId = req.body.problemTypeId;
        const reporterId = req.body.reporterId;
        const userTypeId = req.body.userTypeId;
        const existingProblemType = await db_1.default.problem_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemTypeId))
            }
        });
        if (!existingProblemType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Problem type does not exist.`));
        }
        const existingUserType = await db_1.default.user_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(userTypeId))
            }
        });
        if (!existingUserType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User type does not exist.`));
        }
        const existingStatus = await db_1.default.statuses.findUnique({
            where: {
                name: statuses_1.Status.Pending
            }
        });
        if (!existingStatus) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Status does not exist.`));
        }
        let existingUser = null;
        switch (existingUserType.name) {
            case userTypes_1.UserType.Administrator:
                existingUser = await db_1.default.administrators.findUnique({
                    where: {
                        id: node_buffer_1.Buffer.from((0, uuid_1.parse)(reporterId))
                    }
                });
                break;
            case userTypes_1.UserType.Teacher:
                existingUser = await db_1.default.teachers.findUnique({
                    where: {
                        id: node_buffer_1.Buffer.from((0, uuid_1.parse)(reporterId))
                    }
                });
                break;
            case userTypes_1.UserType.Parent:
                existingUser = await db_1.default.parents.findUnique({
                    where: {
                        id: node_buffer_1.Buffer.from((0, uuid_1.parse)(reporterId))
                    }
                });
                break;
            case userTypes_1.UserType.Student:
                existingUser = await db_1.default.students.findUnique({
                    where: {
                        id: node_buffer_1.Buffer.from((0, uuid_1.parse)(reporterId))
                    }
                });
                break;
        }
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User does not exist.`));
        }
        const createdProblem = await db_1.default.problems_gradebook.create({
            data: {
                description: description,
                reported_time: new Date(),
                problem_type_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemTypeId)),
                reporter_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(reporterId)),
                user_type_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(userTypeId)),
                status_id: existingStatus.id
            }
        });
        const responseData = {
            ...createdProblem,
            id: (0, uuid_1.stringify)(createdProblem.id),
            reported_time: createdProblem.reported_time.toISOString(),
            problem_type_id: (0, uuid_1.stringify)(createdProblem.problem_type_id),
            reporter_id: (0, uuid_1.stringify)(createdProblem.reporter_id),
            user_type_id: (0, uuid_1.stringify)(createdProblem.user_type_id),
            status_id: (0, uuid_1.stringify)(createdProblem.status_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Problem created successfully.`));
    }
    catch (err) {
        console.error('Error creating problem', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating problem. Please try again later.'));
    }
};
exports.createProblem = createProblem;
const getProblems = async (req, res) => {
    try {
        const problems = await db_1.default.problems_gradebook.findMany({
            include: {
                problem_types: true,
                user_types: true,
                statuses: true
            },
        });
        const responseData = [];
        for (const problem of problems) {
            let existingUser = null;
            switch (problem.user_types.name) {
                case userTypes_1.UserType.Administrator:
                    existingUser = await db_1.default.administrators.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case userTypes_1.UserType.Teacher:
                    existingUser = await db_1.default.teachers.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case userTypes_1.UserType.Parent:
                    existingUser = await db_1.default.parents.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case userTypes_1.UserType.Student:
                    existingUser = await db_1.default.students.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
            }
            if (!existingUser) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User does not exist.`));
            }
            responseData.push({
                ...problem,
                id: (0, uuid_1.stringify)(problem.id),
                reported_time: problem.reported_time.toISOString(),
                problem_type_id: (0, uuid_1.stringify)(problem.problem_type_id),
                reporter_id: (0, uuid_1.stringify)(problem.reporter_id),
                user_type_id: (0, uuid_1.stringify)(problem.user_type_id),
                status_id: (0, uuid_1.stringify)(problem.status_id),
                problem_types: {
                    ...problem.problem_types,
                    id: (0, uuid_1.stringify)(problem.problem_types.id),
                },
                user_types: {
                    ...problem.user_types,
                    id: (0, uuid_1.stringify)(problem.user_types.id),
                },
                statuses: {
                    ...problem.statuses,
                    id: (0, uuid_1.stringify)(problem.statuses.id),
                },
                reporter: {
                    id: (0, uuid_1.stringify)(existingUser.id),
                    pesel: existingUser.pesel,
                    email: existingUser.email,
                    phone_number: existingUser.phone_number,
                    first_name: existingUser.first_name,
                    last_name: existingUser.last_name,
                },
            });
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Problems retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving problems', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving problems. Please try again later.'));
    }
};
exports.getProblems = getProblems;
const getProblemsByType = async (req, res) => {
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
        const problems = await db_1.default.problems_gradebook.findMany({
            where: {
                problem_type_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemTypeId))
            },
            include: {
                problem_types: true,
                user_types: true,
                statuses: true
            }
        });
        const responseData = [];
        for (const problem of problems) {
            let existingUser = null;
            switch (problem.user_types.name) {
                case userTypes_1.UserType.Administrator:
                    existingUser = await db_1.default.administrators.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case userTypes_1.UserType.Teacher:
                    existingUser = await db_1.default.teachers.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case userTypes_1.UserType.Parent:
                    existingUser = await db_1.default.parents.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
                case userTypes_1.UserType.Student:
                    existingUser = await db_1.default.students.findUnique({
                        where: {
                            id: problem.reporter_id,
                        },
                    });
                    break;
            }
            if (!existingUser) {
                return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User does not exist.`));
            }
            responseData.push({
                ...problem,
                id: (0, uuid_1.stringify)(problem.id),
                reported_time: problem.reported_time.toISOString(),
                problem_type_id: (0, uuid_1.stringify)(problem.problem_type_id),
                reporter_id: (0, uuid_1.stringify)(problem.reporter_id),
                user_type_id: (0, uuid_1.stringify)(problem.user_type_id),
                status_id: (0, uuid_1.stringify)(problem.status_id),
                problem_types: {
                    ...problem.problem_types,
                    id: (0, uuid_1.stringify)(problem.problem_types.id),
                },
                user_types: {
                    ...problem.user_types,
                    id: (0, uuid_1.stringify)(problem.user_types.id),
                },
                statuses: {
                    ...problem.statuses,
                    id: (0, uuid_1.stringify)(problem.statuses.id),
                },
                reporter: {
                    id: (0, uuid_1.stringify)(existingUser.id),
                    pesel: existingUser.pesel,
                    email: existingUser.email,
                    phone_number: existingUser.phone_number,
                    first_name: existingUser.first_name,
                    last_name: existingUser.last_name,
                },
            });
        }
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, 'Problems retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving problems', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving problems. Please try again later.'));
    }
};
exports.getProblemsByType = getProblemsByType;
const updateProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const statusId = req.body.statusId;
        const existingProblem = await db_1.default.problems_gradebook.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemId))
            }
        });
        if (!existingProblem) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Problem does not exist.`));
        }
        const existingStatus = await db_1.default.statuses.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(statusId))
            }
        });
        if (!existingStatus) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Status does not exist.`));
        }
        const updatedProblem = await db_1.default.problems_gradebook.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemId))
            },
            data: {
                status_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(statusId))
            }
        });
        const responseData = {
            ...updatedProblem,
            id: (0, uuid_1.stringify)(updatedProblem.id),
            reported_time: updatedProblem.reported_time.toISOString(),
            problem_type_id: (0, uuid_1.stringify)(updatedProblem.problem_type_id),
            reporter_id: (0, uuid_1.stringify)(updatedProblem.reporter_id),
            user_type_id: (0, uuid_1.stringify)(updatedProblem.user_type_id),
            status_id: (0, uuid_1.stringify)(updatedProblem.status_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Problem updated successfully.`));
    }
    catch (err) {
        console.error('Error updating problem', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating problem. Please try again later.'));
    }
};
exports.updateProblem = updateProblem;
const deleteProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId;
        const existingProblem = await db_1.default.problems_gradebook.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemId))
            }
        });
        if (!existingProblem) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Problem does not exist.`));
        }
        const deletedProblem = await db_1.default.problems_gradebook.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(problemId))
            }
        });
        const responseData = {
            ...deletedProblem,
            id: (0, uuid_1.stringify)(deletedProblem.id),
            reported_time: deletedProblem.reported_time.toISOString(),
            problem_type_id: (0, uuid_1.stringify)(deletedProblem.problem_type_id),
            reporter_id: (0, uuid_1.stringify)(deletedProblem.reporter_id),
            user_type_id: (0, uuid_1.stringify)(deletedProblem.user_type_id),
            status_id: (0, uuid_1.stringify)(deletedProblem.status_id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Problem deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting problem', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting problem. Please try again later.'));
    }
};
exports.deleteProblem = deleteProblem;
