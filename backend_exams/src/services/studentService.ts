import prisma from '../db';
import { convertBuffersToUUIDs } from '../utils/uuidUtils';
// import { ConvertedStudent } from '../interfaces/ConvertedTypes';

// const studentSelect = {
//     id: true,
//     pesel: true,
//     email: true,
//     phone_number: true,
//     first_name: true,
//     last_name: true,
//     reset_password_token: true,
//     reset_password_expires: true,
//     class_id: true,
// };

// export const getAllStudents = async (): Promise<ConvertedStudent[]> => {
//     // const students = await prisma.students.findMany({
//     //     select: studentSelect,
//     // });

//     // return convertBuffersToUUIDs(students) as ConvertedStudent[];
// };
