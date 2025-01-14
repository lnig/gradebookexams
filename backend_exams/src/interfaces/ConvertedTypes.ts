export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  class_id: string | null;
}
  
export interface Class {
  id: string;
  name: string;
  teacher_id: string | null;
}
  
export interface StudentExam {
  students: Student;
}
  
 export interface ClassExam {
  classes: Class;
}
  