"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentsForParent = exports.deleteStudentParentRelationship = exports.createStudentParentRelationship = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createStudentParentRelationship = async (req, res) => {
    try {
        const studentId = req.body.studentId;
        const parentId = req.body.parentId;
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const existingParent = await db_1.default.parents.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(parentId))
            }
        });
        if (!existingParent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Parent does not exist.`));
        }
        const existingEntry = await db_1.default.students_parents.findUnique({
            where: {
                student_id_parent_id: {
                    student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                    parent_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(parentId))
                }
            }
        });
        if (existingEntry) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Parent already assigned to student.`));
        }
        const createdBond = await db_1.default.students_parents.create({
            data: {
                student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                parent_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(parentId))
            }
        });
        const responseData = {
            student_id: (0, uuid_1.stringify)(createdBond.student_id),
            parent_id: (0, uuid_1.stringify)(createdBond.parent_id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Parent assigned to student successfully.`));
    }
    catch (err) {
        console.error('Error assigning parent to student', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while assigning parent to student. Please try again later.'));
    }
};
exports.createStudentParentRelationship = createStudentParentRelationship;
const deleteStudentParentRelationship = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const parentId = req.params.parentId;
        const criteria = {
            where: {
                student_id_parent_id: {
                    student_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId)),
                    parent_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(parentId))
                }
            }
        };
        const existingStudent = await db_1.default.students.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(studentId))
            }
        });
        if (!existingStudent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Student does not exist.`));
        }
        const existingParent = await db_1.default.parents.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(parentId))
            }
        });
        if (!existingParent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Parent does not exist.`));
        }
        const existingEntry = await db_1.default.students_parents.findUnique(criteria);
        if (!existingEntry) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Relationship does not exist.`));
        }
        const removedBond = await db_1.default.students_parents.delete(criteria);
        const responseData = {
            student_id: (0, uuid_1.stringify)(removedBond.student_id),
            parent_id: (0, uuid_1.stringify)(removedBond.parent_id),
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Parent unassigned from student successfully.`));
    }
    catch (err) {
        console.error('Error unassigning parent from student', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while unassigning parent from student. Please try again later.'));
    }
};
exports.deleteStudentParentRelationship = deleteStudentParentRelationship;
const getStudentsForParent = async (req, res) => {
    try {
        const parentId = req.params.parentId;
        if (!parentId) {
            return res.status(401).json((0, responseInterfaces_1.createErrorResponse)('Parent ID not found.'));
        }
        const existingParent = await db_1.default.parents.findUnique({
            where: { id: node_buffer_1.Buffer.from((0, uuid_1.parse)(parentId)) },
        });
        if (!existingParent) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)('Parent does not exist.'));
        }
        const studentRelations = await db_1.default.students_parents.findMany({
            where: { parent_id: node_buffer_1.Buffer.from((0, uuid_1.parse)(parentId)) },
            include: { students: true },
        });
        if (studentRelations.length === 0) {
            return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)([], 'No students associated with this parent.'));
        }
        const studentIds = studentRelations.map((relation) => (0, uuid_1.stringify)(relation.student_id));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(studentIds, 'Students retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving students for parent:', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving students. Please try again later.'));
    }
};
exports.getStudentsForParent = getStudentsForParent;
