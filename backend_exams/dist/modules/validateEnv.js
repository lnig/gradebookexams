"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMTP_PASS = exports.SMTP_USER = exports.DATABASE_URL = exports.SECRET_KEY = exports.PORT = void 0;
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
console.log({ PORT, SECRET_KEY, DATABASE_URL, SMTP_USER, SMTP_PASS });
if (!PORT || !SECRET_KEY || !DATABASE_URL || !SMTP_USER || !SMTP_PASS) {
    console.log({ PORT, SECRET_KEY, DATABASE_URL, SMTP_USER, SMTP_PASS });
    throw new Error('Missing required environment variables. Please check your .env file.');
}
