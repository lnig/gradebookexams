export interface CreateExamInput {
    title: string;
    lesson_id: string;
    start_date_time: string; 
    end_date_time: string;
    visibility?: boolean;
    number_of_questions: number;
    duration: number; 
    teacher_id: string;
    description: string;
    number_of_tries: number;
    multiple_tries?: boolean;
    randomise_questions?: boolean;
    time_limit_for_each_question?: boolean;
    end_test_after_leaving_window?: boolean;
    block_copying_pasting?: boolean;
    randomise_answers?: boolean;
    latest_attempt_counts?: boolean;
    best_attempt_counts?: boolean;
    hide_results?: boolean;
    display_points_per_question?: boolean;
    show_correct_answers?: boolean;
    allow_navigation?: boolean;
    allow_review?: boolean;

}