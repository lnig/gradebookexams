export interface assignParticipantsToExam {
    classes?: string[];
    students?: string[];
}

export interface Participant {
    firstName: string;
    lastName: string;
    total_score: number;
    max_score: number;
    start_time: Date;
    end_time: Date | null;
}