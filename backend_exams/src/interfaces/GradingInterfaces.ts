export interface ClosedAnswerInput {
    closed_question_id: string;
    closed_answer_id: string;
}

export interface OpenAnswerInput {
    open_question_id: string;
    description: string;
}

export interface SaveAttemptInput {
    closed_answers: ClosedAnswerInput[];
    open_answers: OpenAnswerInput[];
}

export interface GradingResult {
    totalScore: number | null;
    individualScores: {
        closed: { [questionId: string]: number };
        open: { [questionId: string]: number };
    };
}

export interface GradeOpenAnswerInput {
    student_open_answer_id: string;
    score: number;
}

export interface OpenAnswerToGrade {
    student_open_answer_id: string;
    question_description: string;
    attempt_number: number,
    student_description: string;
    student_score: number | null;
    max_score: number;
}

export interface StudentOpenAnswers {
    firstName: string;
    lastName: string;
    questions: OpenAnswerToGrade[];
}

export interface StudentToGrade {
    attemptId: string;
    attemptNumber: string;
    end_time?: string;
    firstName: string;
    lastName: string;
    total_score?: number;
    max_score?: number;
}


export interface OpenAnswersToGradeResponse {
    exam_id: string;
    exam_name: string | null;
    open_questions_to_grade: StudentOpenAnswers[];
}


export interface GradeToInsert {
    id: Buffer;
    student_id: Buffer;
    attempt_id: Buffer;
    exam_id: Buffer;
    grade: string;
    description?: string;
}

export interface AttemptToUpdate {
    id: Buffer;
    graded: boolean;
}