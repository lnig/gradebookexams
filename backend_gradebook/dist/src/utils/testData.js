"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionType1 = exports.update2 = exports.update1 = exports.problem2 = exports.problem1 = exports.problemType2 = exports.problemType1 = exports.status2 = exports.status1 = exports.exam4 = exports.exam3 = exports.exam2 = exports.exam1 = exports.schoolEvent2 = exports.schoolEvent1 = exports.eventType2 = exports.eventType1 = exports.homework2 = exports.homework1 = exports.finalGrade2 = exports.finalGrade1 = exports.grade2 = exports.grade1 = exports.className2 = exports.className1 = exports.semester4 = exports.semester3 = exports.semester2 = exports.semester1 = exports.schoolYear2 = exports.schoolYear1 = exports.userType4 = exports.userType3 = exports.userType2 = exports.userType1 = exports.messageData = exports.lessonsData4 = exports.lessonsData3 = exports.lessonsData2 = exports.lessonsData1 = exports.subject2 = exports.subject1 = exports.student2 = exports.student1 = exports.parent2 = exports.parent1 = exports.teacher2 = exports.teacher1 = exports.administrator2 = exports.administrator1 = void 0;
exports.newDescription = exports.newPassword = exports.nonExistentEmail = exports.nonExistentPassword = exports.emptyString = exports.invalidIdUrl = exports.nonExistentId = exports.openQuestionResponse2 = exports.openQuestionResponse1 = exports.openQuestion2 = exports.openQuestion1 = exports.closedQuestionResponse2 = exports.closedQuestionResponse1 = exports.closedQuestion2 = exports.closedQuestion1 = exports.survey2 = exports.survey1 = exports.questionType2 = void 0;
const questionTypes_1 = require("../enums/questionTypes");
const userTypes_1 = require("../enums/userTypes");
exports.administrator1 = {
    pesel: '11111111111',
    email: 'administrator1@administrator.com',
    phoneNumber: '601234567',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Administrator',
    lastName: 'Administrator'
};
exports.administrator2 = {
    pesel: '22222222222',
    email: 'administrator2@administrator.com',
    phoneNumber: '601234568',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Administrator',
    lastName: 'Administrator'
};
exports.teacher1 = {
    pesel: '33333333333',
    email: 'teacher1@teacher.com',
    phoneNumber: '601234569',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Teacher',
    lastName: 'Teacher'
};
exports.teacher2 = {
    pesel: '44444444444',
    email: 'teacher2@teacher.com',
    phoneNumber: '601234570',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Teacher',
    lastName: 'Teacher'
};
exports.parent1 = {
    pesel: '55555555555',
    email: 'parent1@parent.com',
    phoneNumber: '601234571',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Parent',
    lastName: 'Parent'
};
exports.parent2 = {
    pesel: '66666666666',
    email: 'parent2@parent.com',
    phoneNumber: '601234572',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Parent',
    lastName: 'Parent'
};
exports.student1 = {
    pesel: '77777777777',
    email: 'student1@student.com',
    phoneNumber: '601234573',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Student',
    lastName: 'Student'
};
exports.student2 = {
    pesel: '88888888888',
    email: 'student2@student.com',
    phoneNumber: '601234574',
    password: 'password',
    passwordConfirm: 'password',
    firstName: 'Student',
    lastName: 'Student'
};
exports.subject1 = {
    name: 'Math'
};
exports.subject2 = {
    name: 'Geography'
};
exports.lessonsData1 = {
    startDate: '2024-10-01',
    endDate: '2024-11-01',
    lessonSchedules: [
        {
            dayOfWeek: 2,
            startTime: '12:00',
            endTime: '13:00',
            frequency: 1
        }, {
            dayOfWeek: 5,
            startTime: '15:00',
            endTime: '16:00',
            frequency: 2
        }
    ],
};
exports.lessonsData2 = {
    startDate: '2024-12-22',
    endDate: '2024-12-28',
    lessonSchedules: [
        {
            dayOfWeek: 2,
            startTime: '12:00',
            endTime: '13:00',
            frequency: 1
        }, {
            dayOfWeek: 3,
            startTime: '15:00',
            endTime: '16:00',
            frequency: 2
        }
    ],
};
exports.lessonsData3 = {
    startDate: '2024-12-15',
    endDate: '2024-12-21',
    lessonSchedules: [
        {
            dayOfWeek: 2,
            startTime: '12:00',
            endTime: '13:00',
            frequency: 1
        }, {
            dayOfWeek: 5,
            startTime: '15:00',
            endTime: '16:00',
            frequency: 2
        }
    ],
};
exports.lessonsData4 = {
    startDate: '2025-01-01',
    endDate: '2025-02-01',
    lessonSchedules: [
        {
            dayOfWeek: 5,
            startTime: '13:00',
            endTime: '14:00',
            frequency: 2
        },
        {
            dayOfWeek: 5,
            startTime: '15:00',
            endTime: '16:00',
            frequency: 2
        }
    ],
};
exports.messageData = {
    subject: 'Subject',
    content: 'Content',
};
exports.userType1 = {
    name: userTypes_1.UserType.Student
};
exports.userType2 = {
    name: userTypes_1.UserType.Parent
};
exports.userType3 = {
    name: userTypes_1.UserType.Teacher
};
exports.userType4 = {
    name: userTypes_1.UserType.Administrator
};
exports.schoolYear1 = {
    name: '2024/2025',
    startDate: '2024-10-01',
    endDate: '2025-06-30'
};
exports.schoolYear2 = {
    name: '2025/2026',
    startDate: '2025-10-01',
    endDate: '2026-06-30'
};
exports.semester1 = {
    semester: 1,
    startDate: '2024-10-01',
    endDate: '2025-02-10'
};
exports.semester2 = {
    semester: 2,
    startDate: '2025-02-26',
    endDate: '2025-06-30'
};
exports.semester3 = {
    semester: 1,
    startDate: '2025-10-01',
    endDate: '2026-02-10'
};
exports.semester4 = {
    semester: 2,
    startDate: '2026-02-26',
    endDate: '2026-06-30'
};
exports.className1 = {
    name: 'IA'
};
exports.className2 = {
    name: 'IIA'
};
exports.grade1 = {
    grade: 3,
    weight: 1,
    description: 'Activity during the lesson'
};
exports.grade2 = {
    grade: 6,
    weight: 2,
    description: 'Graphing geometry shadows in axonometry'
};
exports.finalGrade1 = {
    grade: 3
};
exports.finalGrade2 = {
    grade: 6
};
exports.homework1 = {
    description: 'Homework short description',
    deadline: '2025-01-10'
};
exports.homework2 = {
    description: 'Homework long description',
    deadline: '2025-01-10'
};
exports.eventType1 = {
    name: 'Theme Day'
};
exports.eventType2 = {
    name: 'Talent Show'
};
exports.schoolEvent1 = {
    name: 'Science Fair',
    location: 'Auditorium',
    description: 'An event showcasing various science projects by students.',
    date: '2024-05-15',
    startTime: '09:00',
    endTime: '15:00'
};
exports.schoolEvent2 = {
    name: 'International Day',
    location: 'School Grounds',
    description: 'A day to celebrate and learn about different cultures through performances, food, and exhibitions.',
    date: '2024-06-20',
    startTime: '10:00',
    endTime: '18:00'
};
exports.exam1 = {
    topic: 'Introduction to TypeScript',
    scope: 'Overview of types, interfaces, classes, and generics'
};
exports.exam2 = {
    topic: 'Advanced SQL Queries',
    scope: 'Inner joins, Outer joins, Subqueries, Window Functions'
};
exports.exam3 = {
    topic: 'Node.js Fundamentals',
    scope: 'Event-Driven Architecture, Asynchronous Programming, Middleware, and API Development'
};
exports.exam4 = {
    topic: 'Advanced TypeScript',
    scope: 'Generics, Decorators, Module Augmentation, and Advanced Type Manipulation'
};
exports.status1 = {
    name: 'Resolved'
};
exports.status2 = {
    name: 'Pending'
};
exports.problemType1 = {
    name: 'Data Issue'
};
exports.problemType2 = {
    name: 'Technical Issues'
};
exports.problem1 = {
    description: 'Incorrect Assessment'
};
exports.problem2 = {
    description: 'Problems with Page Display'
};
exports.update1 = {
    description: 'Initial release with basic features.',
    version: '1.0.0'
};
exports.update2 = {
    description: 'Minor bug fixes and performance improvements.',
    version: '1.1.0'
};
exports.questionType1 = {
    name: questionTypes_1.QuestionType.Closed
};
exports.questionType2 = {
    name: questionTypes_1.QuestionType.Open
};
exports.survey1 = {
    name: 'Test Survey 1',
    description: 'Test description 1',
    startDate: '2025-01-09',
    endDate: '2025-01-11',
    startTime: '12:00',
    endTime: '15:00',
};
exports.survey2 = {
    name: 'Test Survey 2',
    description: 'Test description 2',
    startDate: '2025-01-12',
    endDate: '2025-01-15',
    startTime: '13:00',
    endTime: '14:00',
};
exports.closedQuestion1 = {
    content: 'Do You like swimming?'
};
exports.closedQuestion2 = {
    content: 'Do You like running?'
};
exports.closedQuestionResponse1 = {
    content: 'Yes'
};
exports.closedQuestionResponse2 = {
    content: 'No'
};
exports.openQuestion1 = {
    content: 'Do You like horse riding?'
};
exports.openQuestion2 = {
    content: 'Do You like skating?'
};
exports.openQuestionResponse1 = {
    content: 'Yes'
};
exports.openQuestionResponse2 = {
    content: 'No'
};
exports.nonExistentId = 'f47ac10b-58cc-11e8-b624-0800200c9a66';
exports.invalidIdUrl = '%20';
exports.emptyString = '';
exports.nonExistentPassword = 'nonexistentpassword';
exports.nonExistentEmail = 'user@user.com';
exports.newPassword = 'newpassword';
exports.newDescription = 'newdescription';
