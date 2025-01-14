export interface OpenAnswerInput {
    id?: string;
    description: string;
}

export interface OpenQuestionInput {
    id?: string;
    description: string;
    score: number;
    auto_check: boolean;
    answers?: OpenAnswerInput[];
}

export interface ClosedAnswerInput {
    id?: string;
    description: string;
    is_correct: boolean;
}

export interface ClosedQuestionInput {
    id?: string;
    description: string;
    is_multiple: boolean,
    score: number;
    answers: ClosedAnswerInput[];
}

export interface SelectedQuestion {
    id: string;
    description: string;
    type: 'OPEN' | 'CLOSED';
    score?: number;
    is_multiple: boolean | null;
    answers?: Array<{ id: string; description: string }>;
}

export interface UpsertAnswer {
    where: { id?: Buffer };
    create: { id: Buffer; description: string; is_correct?: boolean };
    update: { description: string; is_correct?: boolean };
}