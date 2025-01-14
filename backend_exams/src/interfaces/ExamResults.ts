export interface ParticipantAttempt {
    attempt_id: string,
    first_name: string;
    last_name: string;
    total_score?: number;
    max_score: number;
    start_time: string;
    end_time?: string;
    attempt_number: number;
}

export interface ClosedQuestionStatistic {
    description: string;
    score?: number;
    answers: {
        description: string;
        response_count: number;
    }[];
}

export interface OpenQuestionStatisticAutoCheck {
    description: string;
    correct_count: number;
    incorrect_count: number;
    score: number;
}

export interface OpenQuestionStatisticManualCheck {
    description: string;
    correct_count: number;
    partial_correct_count: number;
    wrong_count: number;
    score: number;
}
export interface ScoreDistribution {
    range: string;
    count: number;
}
export type OpenQuestionStatistic = OpenQuestionStatisticAutoCheck | OpenQuestionStatisticManualCheck;

export interface ExamStatistics {
    exam_title: string | null,
    Students: ParticipantAttempt[];
    Statistics: {
        closedQuestions: ClosedQuestionStatistic[];
        openQuestions: OpenQuestionStatistic[];
        scoreDistribution: ScoreDistribution[];
    };
}