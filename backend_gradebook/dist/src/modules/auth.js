"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = exports.generateJWT = exports.hashPassword = exports.comparePasswords = void 0;
const validateEnv_js_1 = require("./validateEnv.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const responseInterfaces_js_1 = require("../interfaces/responseInterfaces.js");
const comparePasswords = (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.comparePasswords = comparePasswords;
const hashPassword = (password) => {
    return bcrypt_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
const generateJWT = (authUser) => {
    return jsonwebtoken_1.default.sign(authUser, validateEnv_js_1.SECRET_KEY);
};
exports.generateJWT = generateJWT;
const authenticate = (req, res, next) => {
    try {
        const bearer = req.headers.authorization;
        if (!bearer) {
            return res.status(401).json((0, responseInterfaces_js_1.createErrorResponse)('No token provided.'));
        }
        const token = bearer.split(' ')[1].replace(/"/g, '');
        if (!token) {
            return res.status(401).json((0, responseInterfaces_js_1.createErrorResponse)('Invalid token format.'));
        }
        const payload = jsonwebtoken_1.default.verify(token, validateEnv_js_1.SECRET_KEY);
        req.user = payload;
        next();
    }
    catch (err) {
        console.error(err);
        return res.status(401).json((0, responseInterfaces_js_1.createErrorResponse)('Invalid token.'));
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json((0, responseInterfaces_js_1.createErrorResponse)('Not authorized.'));
        }
        next();
    };
};
exports.authorize = authorize;
