import { parse as uuidParse, validate as isUUID } from 'uuid';
import { uuidStringify } from '../utils/uuidUtils';
import prisma from '../db';

export async function getClassesByTeacher(teacher_id: string) {
  if (!isUUID(teacher_id)) {
    throw new Error('Invalid teacher ID format.');
  }

  const teacherIdBuffer = Buffer.from(uuidParse(teacher_id));

  const lessonsRaw = await prisma.lessons.findMany({
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

  const uniqueClassesMap = new Map<string, any>();

  for (const lesson of lessonsRaw) {
    if (!lesson.classes) continue;

    const cls = lesson.classes;
    const classIdHex = cls.id.toString('hex');

    if (!uniqueClassesMap.has(classIdHex)) {
      uniqueClassesMap.set(classIdHex, {
        id: uuidStringify(cls.id),
        name: cls.class_names.name,
        teacher_id: cls.teacher_id ? uuidStringify(cls.teacher_id) : null
      });
    }
  }

  return Array.from(uniqueClassesMap.values());
}
