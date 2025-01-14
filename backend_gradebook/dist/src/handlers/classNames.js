"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClassName = exports.updateClassName = exports.getClassNames = exports.createClassName = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createClassName = async (req, res) => {
    try {
        const name = req.body.name;
        const existingClassName = await db_1.default.class_names.findUnique({
            where: {
                name: name
            }
        });
        if (existingClassName) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`Class name already exists.`));
        }
        const createdClassName = await db_1.default.class_names.create({
            data: {
                name: name
            }
        });
        const responseData = {
            ...createdClassName,
            id: (0, uuid_1.stringify)(createdClassName.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Class name created successfully.`));
    }
    catch (err) {
        console.error('Error creating class name', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating class name. Please try again later.'));
    }
};
exports.createClassName = createClassName;
const getClassNames = async (req, res) => {
    try {
        const classNames = await db_1.default.class_names.findMany();
        const responeData = classNames.map(className => ({
            ...className,
            id: (0, uuid_1.stringify)(className.id)
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responeData, 'Class names retrieved successfully.'));
    }
    catch (err) {
        console.error('Error retrieving class names', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving class names. Please try again later.'));
    }
};
exports.getClassNames = getClassNames;
const updateClassName = async (req, res) => {
    try {
        const classNameId = req.params.classNameId;
        const name = req.body.name;
        const existingClassName = await db_1.default.class_names.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId))
            }
        });
        if (!existingClassName) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class names does not exist.`));
        }
        const updatedClassName = await db_1.default.class_names.update({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId))
            },
            data: {
                name: name
            }
        });
        const responseData = {
            ...updatedClassName,
            id: (0, uuid_1.stringify)(updatedClassName.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Class name successfully updated.`));
    }
    catch (err) {
        console.error('Error updating class name', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while updating class name. Please try again later.'));
    }
};
exports.updateClassName = updateClassName;
const deleteClassName = async (req, res) => {
    try {
        const classNameId = req.params.classNameId;
        const existingClassName = await db_1.default.class_names.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId))
            }
        });
        if (!existingClassName) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`Class name does not exist.`));
        }
        const deletedClassName = await db_1.default.class_names.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(classNameId))
            }
        });
        const responseData = {
            ...deletedClassName,
            id: (0, uuid_1.stringify)(deletedClassName.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Class name deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting class name', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting class name. Please try again later.'));
    }
};
exports.deleteClassName = deleteClassName;
