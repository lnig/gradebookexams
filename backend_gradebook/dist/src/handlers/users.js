"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.signUp = exports.signIn = void 0;
const db_js_1 = __importDefault(require("../db.js"));
const auth_1 = require("../modules/auth");
const nodemailer_1 = __importDefault(require("nodemailer"));
const responseInterfaces_js_1 = require("../interfaces/responseInterfaces.js");
const validateEnv_js_1 = require("../modules/validateEnv.js");
const uuid_1 = require("uuid");
const userTypes_js_1 = require("../enums/userTypes.js");
function isStudent(user) {
    return user.class_id !== undefined;
}
const signIn = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const criteria = {
            where: {
                email: email
            }
        };
        let existingUser = null;
        let role = userTypes_js_1.UserType.Unknown;
        if (!existingUser) {
            existingUser = await db_js_1.default.students.findUnique(criteria);
            if (existingUser) {
                role = userTypes_js_1.UserType.Student;
            }
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.teachers.findUnique(criteria);
            if (existingUser) {
                role = userTypes_js_1.UserType.Teacher;
            }
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.parents.findUnique(criteria);
            if (existingUser) {
                role = userTypes_js_1.UserType.Parent;
            }
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.administrators.findUnique(criteria);
            if (existingUser) {
                role = userTypes_js_1.UserType.Administrator;
            }
        }
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_js_1.createErrorResponse)('Invalid credentials.'));
        }
        const isValid = await (0, auth_1.comparePasswords)(password, existingUser.password);
        if (!isValid) {
            return res.status(401).json((0, responseInterfaces_js_1.createErrorResponse)('Invalid credentials.'));
        }
        const authUser = {
            id: (0, uuid_1.stringify)(existingUser.id),
            email: existingUser.email,
            firstName: existingUser.first_name,
            lastName: existingUser.last_name,
            role: role,
            userId: (0, uuid_1.stringify)(existingUser.id),
        };
        const responseData = {
            jwt: (0, auth_1.generateJWT)(authUser),
            id: (0, uuid_1.stringify)(existingUser.id)
        };
        return res.status(200).json((0, responseInterfaces_js_1.createSuccessResponse)(responseData, 'Signed in successfully.'));
    }
    catch (err) {
        console.error('Error signing in', err);
        res.status(500).json((0, responseInterfaces_js_1.createErrorResponse)('An unexpected error occurred while signing in. Please try again later.'));
    }
};
exports.signIn = signIn;
const signUp = async (req, res, role) => {
    try {
        if (role === userTypes_js_1.UserType.Unknown) {
            return res.status(422).json((0, responseInterfaces_js_1.createErrorResponse)('Invalid user type.'));
        }
        const pesel = req.body.pesel;
        const email = req.body.email;
        const phoneNumber = req.body.phoneNumber;
        const password = req.body.password;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const criteria = {
            where: {
                OR: [
                    {
                        pesel: pesel
                    },
                    {
                        email: email
                    },
                    {
                        phone_number: phoneNumber
                    }
                ],
            }
        };
        let existingUsers = null;
        switch (role) {
            case userTypes_js_1.UserType.Student:
                existingUsers = await db_js_1.default.students.findMany(criteria);
                break;
            case userTypes_js_1.UserType.Teacher:
                existingUsers = await db_js_1.default.teachers.findMany(criteria);
                break;
            case userTypes_js_1.UserType.Parent:
                existingUsers = await db_js_1.default.parents.findMany(criteria);
                break;
            case userTypes_js_1.UserType.Administrator:
                existingUsers = await db_js_1.default.administrators.findMany(criteria);
                break;
        }
        if (existingUsers.length > 0) {
            return res.status(409).json((0, responseInterfaces_js_1.createErrorResponse)('User already exists.'));
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const dataToCreate = {
            data: {
                pesel: pesel,
                email: email,
                phone_number: phoneNumber,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
            }
        };
        let createdUser;
        switch (role) {
            case userTypes_js_1.UserType.Student:
                createdUser = await db_js_1.default.students.create(dataToCreate);
                break;
            case userTypes_js_1.UserType.Teacher:
                createdUser = await db_js_1.default.teachers.create(dataToCreate);
                break;
            case userTypes_js_1.UserType.Parent:
                createdUser = await db_js_1.default.parents.create(dataToCreate);
                break;
            case userTypes_js_1.UserType.Administrator:
                createdUser = await db_js_1.default.administrators.create(dataToCreate);
                break;
        }
        return res.status(200).json((0, responseInterfaces_js_1.createSuccessResponse)((0, uuid_1.stringify)(createdUser.id), 'Signed up successfully.'));
    }
    catch (err) {
        console.error('Error signing up', err);
        res.status(500).json((0, responseInterfaces_js_1.createErrorResponse)('An unexpected error occurred while signing up. Please try again later.'));
    }
};
exports.signUp = signUp;
const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const criteria = {
            where: {
                email: email
            }
        };
        let existingUser = null;
        let role = userTypes_js_1.UserType.Unknown;
        if (!existingUser) {
            existingUser = await db_js_1.default.students.findUnique(criteria);
            if (existingUser) {
                role = userTypes_js_1.UserType.Student;
            }
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.teachers.findUnique(criteria);
            if (existingUser) {
                role = userTypes_js_1.UserType.Teacher;
            }
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.parents.findUnique(criteria);
            if (existingUser) {
                role = userTypes_js_1.UserType.Parent;
            }
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.administrators.findUnique(criteria);
            if (existingUser) {
                role = userTypes_js_1.UserType.Administrator;
            }
        }
        if (!existingUser) {
            return res.status(404).json((0, responseInterfaces_js_1.createErrorResponse)('Invalid credential.'));
        }
        const authUser = {
            id: (0, uuid_1.stringify)(existingUser.id),
            email: existingUser.email,
            firstName: existingUser.first_name,
            lastName: existingUser.last_name,
            role: role,
            userId: (0, uuid_1.stringify)(existingUser.id),
        };
        const jwt = (0, auth_1.generateJWT)(authUser);
        const dataToUpdate = {
            where: {
                email: email
            },
            data: {
                reset_password_token: jwt,
                reset_password_expires: new Date(Date.now() + 3600000)
            }
        };
        let updatedUser;
        switch (role) {
            case userTypes_js_1.UserType.Student:
                updatedUser = await db_js_1.default.students.update(dataToUpdate);
                break;
            case userTypes_js_1.UserType.Teacher:
                updatedUser = await db_js_1.default.teachers.update(dataToUpdate);
                break;
            case userTypes_js_1.UserType.Parent:
                updatedUser = await db_js_1.default.parents.update(dataToUpdate);
                break;
            case userTypes_js_1.UserType.Administrator:
                updatedUser = await db_js_1.default.administrators.update(dataToUpdate);
                break;
        }
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: validateEnv_js_1.SMTP_USER,
                pass: validateEnv_js_1.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const message = {
            from: "sender@server.com",
            to: "receiver@server.com",
            subject: "Password Reset",
            text: `Click the following link to reset your password: http://localhost:3001/reset-password/${jwt}`
        };
        transporter.sendMail(message, (err, info) => {
            if (err) {
                return res.status(500).json((0, responseInterfaces_js_1.createErrorResponse)('Error sending email.'));
            }
            return res.status(200).json((0, responseInterfaces_js_1.createSuccessResponse)(info.messageId, 'Password reset email sent successfully.'));
        });
    }
    catch (err) {
        console.error('Error recovering password', err);
        res.status(500).json('An unexpected error occurred while recovering password. Please try again later.');
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const user = req.user;
        const password = req.body.password;
        if (user.role === userTypes_js_1.UserType.Unknown) {
            return res.status(422).json((0, responseInterfaces_js_1.createErrorResponse)('Invalid user type.'));
        }
        const criteria = {
            where: {
                email: user.email
            }
        };
        let existingUser = null;
        if (!existingUser) {
            existingUser = await db_js_1.default.students.findUnique(criteria);
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.teachers.findUnique(criteria);
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.parents.findUnique(criteria);
        }
        if (!existingUser) {
            existingUser = await db_js_1.default.administrators.findUnique(criteria);
        }
        if (!existingUser || !existingUser.reset_password_expires || existingUser.reset_password_expires < new Date()) {
            return res.status(400).json((0, responseInterfaces_js_1.createErrorResponse)('Invalid or expired token.'));
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const dataToUpdate = {
            where: {
                email: user.email
            },
            data: {
                password: hashedPassword,
                reset_password_token: null,
                reset_password_expires: null
            }
        };
        let updatedUser;
        switch (user.role) {
            case userTypes_js_1.UserType.Student:
                updatedUser = await db_js_1.default.students.update(dataToUpdate);
                break;
            case userTypes_js_1.UserType.Teacher:
                updatedUser = await db_js_1.default.teachers.update(dataToUpdate);
                break;
            case userTypes_js_1.UserType.Parent:
                updatedUser = await db_js_1.default.parents.update(dataToUpdate);
                break;
            case userTypes_js_1.UserType.Administrator:
                updatedUser = await db_js_1.default.administrators.update(dataToUpdate);
                break;
        }
        const responseData = {
            ...updatedUser,
            id: (0, uuid_1.stringify)(updatedUser.id),
            class_id: isStudent(updatedUser) && updatedUser.class_id ? (0, uuid_1.stringify)(updatedUser.class_id) : undefined
        };
        return res.status(200).json((0, responseInterfaces_js_1.createSuccessResponse)(responseData, `Password reset successfully.`));
    }
    catch (err) {
        console.error('Error resetting password', err);
        res.status(500).json((0, responseInterfaces_js_1.createErrorResponse)('An unexpected error occurred while resetting password. Please try again later.'));
    }
};
exports.resetPassword = resetPassword;
