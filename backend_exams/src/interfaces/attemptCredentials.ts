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