"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRouter_1 = __importDefault(require("./routers/authRouter"));
const examRouter_1 = __importDefault(require("./routers/examRouter"));
const notificationsRouter_1 = __importDefault(require("./routers/notificationsRouter"));
const studentsRouter_1 = __importDefault(require("./routers/studentsRouter"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use('/auth', authRouter_1.default);
app.use('/notifications', notificationsRouter_1.default);
app.use('/student', studentsRouter_1.default);
app.use('/exams', examRouter_1.default);
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
exports.default = app;
