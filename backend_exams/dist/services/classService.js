"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassesByTeacher = getClassesByTeacher;
const uuid_1 = require("uuid");
const uuidUtils_1 = require("../utils/uuidUtils");
const db_1 = __importDefault(require("../db"));
async function getClassesByTeacher(teacher_id) {
    if (!(0, uuid_1.validate)(teacher_id)) {
        throw new Error('Invalid teacher ID format.');
    }
    const teacherIdBuffer = Buffer.from((0, uuid_1.parse)(teacher_id));
    // Pobieramy lekcje danego nauczyciela, wraz z powiązaną klasą i nazwą klasy
    const lessonsRaw = await db_1.default.lessons.findMany({
        where: {
            teacher_id: teacherIdBuffer,
        },
        select: {
            classes: {
                select: {
                    id: true,
                    teacher_id: true,
                    class_names: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
    if (lessonsRaw.length === 0) {
        return [];
    }
    // Dla unikalności używamy Map
    const uniqueClassesMap = new Map();
    for (const lesson of lessonsRaw) {
        if (!lesson.classes)
            continue;
        const cls = lesson.classes;
        const classIdHex = cls.id.toString('hex');
        if (!uniqueClassesMap.has(classIdHex)) {
            uniqueClassesMap.set(classIdHex, {
                id: (0, uuidUtils_1.uuidStringify)(cls.id),
                name: cls.class_names.name,
                teacher_id: cls.teacher_id ? (0, uuidUtils_1.uuidStringify)(cls.teacher_id) : null
            });
        }
    }
    return Array.from(uniqueClassesMap.values());
}
