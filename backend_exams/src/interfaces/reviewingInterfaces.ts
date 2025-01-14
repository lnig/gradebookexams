export interface Answer {
    description: string;
    is_correct?: boolean;
    selected: boolean;
}

export interface Question {
    description: string;
    type: 'OPEN' | 'CLOSED';
    max_score?: number;
    score?: number;
    answers?: Answer[];
    student_answer?: string;
}

export interface AttemptDetailsResponse {
    exam_title: string | undefined;
    attempt_id: string;
    questions: Question[];
}