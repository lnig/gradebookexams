"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserType = exports.getUserTypes = exports.createUserType = void 0;
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const node_buffer_1 = require("node:buffer");
const createUserType = async (req, res) => {
    try {
        const name = req.body.name;
        const existingUserType = await db_1.default.user_types.findUnique({
            where: {
                name: name
            }
        });
        if (existingUserType) {
            return res.status(409).json((0, responseInterfaces_1.createErrorResponse)(`User type already exists.`));
        }
        const createdUserType = await db_1.default.user_types.create({
            data: {
                name: name
            }
        });
        const responseData = {
            ...createdUserType,
            id: (0, uuid_1.stringify)(createdUserType.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `User type created successfully.`));
    }
    catch (err) {
        console.error('Error creating user type', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while creating user type. Please try again later.'));
    }
};
exports.createUserType = createUserType;
const getUserTypes = async (req, res) => {
    try {
        const userTypes = await db_1.default.user_types.findMany();
        const responseData = userTypes.map(userType => ({
            id: (0, uuid_1.stringify)(userType.id),
            name: userType.name,
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `User types retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving user types', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving user types. Please try again later.'));
    }
};
exports.getUserTypes = getUserTypes;
const deleteUserType = async (req, res) => {
    try {
        const userTypeId = req.params.userTypeId;
        const existingUserType = await db_1.default.user_types.findUnique({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(userTypeId))
            }
        });
        if (!existingUserType) {
            return res.status(404).json((0, responseInterfaces_1.createErrorResponse)(`User type does not exist.`));
        }
        const deletedUserType = await db_1.default.user_types.delete({
            where: {
                id: node_buffer_1.Buffer.from((0, uuid_1.parse)(userTypeId))
            }
        });
        const responseData = {
            ...deletedUserType,
            id: (0, uuid_1.stringify)(deletedUserType.id)
        };
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `User type deleted successfully.`));
    }
    catch (err) {
        console.error('Error deleting user type', err);
        res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while deleting user type. Please try again later.'));
    }
};
exports.deleteUserType = deleteUserType;
