"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BEARER_TOKEN = exports.SMTP_PASS = exports.SMTP_USER = exports.DATABASE_URL = exports.SECRET_KEY = exports.PORT = void 0;
const PORT = process.env.PORT;
exports.PORT = PORT;
const SECRET_KEY = process.env.SECRET_KEY;
exports.SECRET_KEY = SECRET_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
exports.DATABASE_URL = DATABASE_URL;
const SMTP_USER = process.env.SMTP_USER;
exports.SMTP_USER = SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
exports.SMTP_PASS = SMTP_PASS;
const BEARER_TOKEN = process.env.BEARER_TOKEN;
exports.BEARER_TOKEN = BEARER_TOKEN;
if (!PORT || !SECRET_KEY || !DATABASE_URL || !SMTP_USER || !SMTP_PASS || !BEARER_TOKEN) {
    throw new Error('Missing required environment variables. Please check your .env file.');
}
