"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const authRouter_1 = __importDefault(require("./routers/authRouter"));
const studentsParentsRouter_1 = __importDefault(require("./routers/studentsParentsRouter"));
const classesRouter_1 = __importDefault(require("./routers/classesRouter"));
const studentsRouter_1 = __importDefault(require("./routers/studentsRouter"));
const lessonsRouter_1 = __importDefault(require("./routers/lessonsRouter"));
const subjectsRouter_1 = __importDefault(require("./routers/subjectsRouter"));
const attendancesRouter_1 = __importDefault(require("./routers/attendancesRouter"));
const userTypesRouter_1 = __importDefault(require("./routers/userTypesRouter"));
const schoolYearsRouter_1 = __importDefault(require("./routers/schoolYearsRouter"));
const semestersRouter_1 = __importDefault(require("./routers/semestersRouter"));
const gradesRouter_1 = __importDefault(require("./routers/gradesRouter"));
const classNamesRouter_1 = __importDefault(require("./routers/classNamesRouter"));
const messages_1 = require("./handlers/messages");
const parentsRouter_1 = __importDefault(require("./routers/parentsRouter"));
const teachersRouter_1 = __importDefault(require("./routers/teachersRouter"));
const administratorsRouter_1 = __importDefault(require("./routers/administratorsRouter"));
const messagesRouter_1 = __importDefault(require("./routers/messagesRouter"));
const homeworksRouter_1 = __importDefault(require("./routers/homeworksRouter"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateEnv_1 = require("./modules/validateEnv");
const schoolEventsRouter_1 = __importDefault(require("./routers/schoolEventsRouter"));
const eventTypesRouter_1 = __importDefault(require("./routers/eventTypesRouter"));
const examsRouter_1 = __importDefault(require("./routers/examsRouter"));
const problemsRouter_1 = __importDefault(require("./routers/problemsRouter"));
const statusesRouter_1 = __importDefault(require("./routers/statusesRouter"));
const problemTypesRouter_1 = __importDefault(require("./routers/problemTypesRouter"));
const updatesRouter_1 = __importDefault(require("./routers/updatesRouter"));
const questionTypesRouter_1 = __importDefault(require("./routers/questionTypesRouter"));
const surveysRouter_1 = __importDefault(require("./routers/surveysRouter"));
const questionsRouter_1 = __importDefault(require("./routers/questionsRouter"));
const path = require('path');
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/auth', authRouter_1.default);
app.use('/student-parent', studentsParentsRouter_1.default);
app.use('/class', classesRouter_1.default);
app.use('/administrator', administratorsRouter_1.default);
app.use('/teacher', teachersRouter_1.default);
app.use('/parent', parentsRouter_1.default);
app.use('/student', studentsRouter_1.default);
app.use('/lesson', lessonsRouter_1.default);
app.use('/subject', subjectsRouter_1.default);
app.use('/attendance', attendancesRouter_1.default);
app.use('/user-type', userTypesRouter_1.default);
app.use('/school-year', schoolYearsRouter_1.default);
app.use('/semester', semestersRouter_1.default);
app.use('/grade', gradesRouter_1.default);
app.use('/class-name', classNamesRouter_1.default);
app.use('/message', messagesRouter_1.default);
app.use('/homework', homeworksRouter_1.default);
app.use('/school-event', schoolEventsRouter_1.default);
app.use('/event-type', eventTypesRouter_1.default);
app.use('/exam', examsRouter_1.default);
app.use('/problem', problemsRouter_1.default);
app.use('/status', statusesRouter_1.default);
app.use('/problem-type', problemTypesRouter_1.default);
app.use('/update', updatesRouter_1.default);
app.use('/question-type', questionTypesRouter_1.default);
app.use('/survey', surveysRouter_1.default);
app.use('/question', questionsRouter_1.default);
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        console.error('Authentication error: No token provided');
        return next(new Error('Authentication error: No token provided'));
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, validateEnv_1.SECRET_KEY);
        socket.user = payload;
        next();
    }
    catch (err) {
        console.error('Authentication error:', err);
        next(new Error('Authentication error'));
    }
});
io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.id}, Socket ID: ${socket.id}`);
    (0, messages_1.messagesHandler)(io, socket);
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${user.id}, Socket ID: ${socket.id}`);
    });
});
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
const buildPath = path.join(__dirname, '..', '..', '..', 'frontend', 'dist');
app.use(express_1.default.static(buildPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});
