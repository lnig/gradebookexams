"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableParents = exports.getParents = exports.signUpParent = void 0;
const users_1 = require("./users");
const userTypes_1 = require("../enums/userTypes");
const db_1 = __importDefault(require("../db"));
const responseInterfaces_1 = require("../interfaces/responseInterfaces");
const uuid_1 = require("uuid");
const signUpParent = (req, res) => {
    return (0, users_1.signUp)(req, res, userTypes_1.UserType.Parent);
};
exports.signUpParent = signUpParent;
const getParents = async (req, res) => {
    try {
        const parents = await db_1.default.parents.findMany();
        const responseData = parents.map(parent => ({
            id: (0, uuid_1.stringify)(parent.id),
            email: parent.email,
            first_name: parent.first_name,
            last_name: parent.last_name,
            role: userTypes_1.UserType.Parent
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Parents retrieved successfully.`));
    }
    catch (err) {
        console.error('Error retrieving parents', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving parents. Please try again later.'));
    }
};
exports.getParents = getParents;
const getAvailableParents = async (req, res) => {
    try {
        const availableParents = await db_1.default.parents.findMany({
            where: {
                students_parents: {
                    none: {}
                }
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true,
            },
        });
        const responseData = availableParents.map(parent => ({
            id: (0, uuid_1.stringify)(parent.id),
            first_name: parent.first_name,
            last_name: parent.last_name,
            email: parent.email,
            phone_number: parent.phone_number,
        }));
        return res.status(200).json((0, responseInterfaces_1.createSuccessResponse)(responseData, `Available parents retrieved successfully.`));
    }
    catch (err) {
        console.error('Error fetching available parents', err);
        return res.status(500).json((0, responseInterfaces_1.createErrorResponse)('An unexpected error occurred while retrieving parents. Please try again later.'));
    }
};
exports.getAvailableParents = getAvailableParents;
