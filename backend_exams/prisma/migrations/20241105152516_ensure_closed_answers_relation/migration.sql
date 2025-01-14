-- CreateTable
CREATE TABLE `students` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `pesel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `reset_password_token` VARCHAR(256) NULL,
    `reset_password_expires` TIMESTAMP(0) NULL,
    `class_id` BINARY(16) NULL,

    UNIQUE INDEX `pesel`(`pesel`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    UNIQUE INDEX `reset_password_token`(`reset_password_token`),
    INDEX `class_id`(`class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `pesel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `reset_password_token` VARCHAR(256) NULL,
    `reset_password_expires` TIMESTAMP(0) NULL,

    UNIQUE INDEX `pesel`(`pesel`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    UNIQUE INDEX `reset_password_token`(`reset_password_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `administrators` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `pesel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `reset_password_token` VARCHAR(256) NULL,
    `reset_password_expires` TIMESTAMP(0) NULL,

    UNIQUE INDEX `pesel`(`pesel`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    UNIQUE INDEX `reset_password_token`(`reset_password_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attempts` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `student_id` BINARY(16) NOT NULL,
    `exam_id` BINARY(16) NOT NULL,
    `attempt_number` INTEGER NOT NULL,
    `total_score` INTEGER NULL,
    `start_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `end_time` TIMESTAMP(0) NULL,

    INDEX `exam_id`(`exam_id`),
    UNIQUE INDEX `unique_attempt`(`student_id`, `exam_id`, `attempt_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `name` VARCHAR(255) NOT NULL,
    `yearbook` VARCHAR(255) NOT NULL,
    `teacher_id` BINARY(16) NULL,

    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes_exams` (
    `class_id` BINARY(16) NOT NULL,
    `exam_id` BINARY(16) NOT NULL,

    INDEX `exam_id`(`exam_id`),
    PRIMARY KEY (`class_id`, `exam_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `closed_answers` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `closed_question_id` BINARY(16) NOT NULL,
    `is_correct` BIT(1) NULL,
    `description` VARCHAR(255) NOT NULL,

    INDEX `closed_question_id`(`closed_question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `closed_questions` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `exam_id` BINARY(16) NOT NULL,
    `score` TINYINT NULL,
    `description` VARCHAR(255) NOT NULL,

    INDEX `exam_id`(`exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `start_date_time` TIMESTAMP(0) NOT NULL,
    `end_date_time` TIMESTAMP(0) NOT NULL,
    `visibility` BIT(1) NOT NULL DEFAULT b'0',
    `number_of_questions` INTEGER NULL,
    `duration` INTEGER NOT NULL,
    `teacher_id` BINARY(16) NOT NULL,
    `description` VARCHAR(255) NULL,
    `number_of_tries` INTEGER NULL DEFAULT 1,
    `multiple_tries` BIT(1) NOT NULL DEFAULT b'0',
    `randomise_answers` BIT(1) NOT NULL DEFAULT b'0',
    `latest_attempt_counts` BIT(1) NOT NULL DEFAULT b'1',
    `best_attempt_counts` BIT(1) NOT NULL DEFAULT b'0',
    `hide_results` BIT(1) NOT NULL DEFAULT b'1',
    `display_points_per_question` BIT(1) NOT NULL DEFAULT b'0',
    `show_correct_answers` BIT(1) NOT NULL DEFAULT b'0',
    `allow_navigation` BIT(1) NOT NULL DEFAULT b'0',
    `allow_review` BIT(1) NOT NULL DEFAULT b'0',

    INDEX `teacher_id`(`teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files_repository` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `title` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `file` LONGBLOB NOT NULL,
    `exam_id` BINARY(16) NOT NULL,

    INDEX `exam_id`(`exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grades_exams` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `student_id` BINARY(16) NOT NULL,
    `exam_id` BINARY(16) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `grade` TINYINT NULL,
    `date_given` TIMESTAMP(0) NOT NULL DEFAULT (now()),

    INDEX `exam_id`(`exam_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grading_scale` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `min_score` INTEGER NOT NULL,
    `max_score` INTEGER NOT NULL,
    `exam_id` BINARY(16) NOT NULL,
    `grades` CHAR(2) NOT NULL,

    INDEX `exam_id`(`exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `open_answers` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `open_question_id` BINARY(16) NOT NULL,
    `description` VARCHAR(255) NOT NULL,

    INDEX `open_question_id`(`open_question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `open_questions` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `exam_id` BINARY(16) NOT NULL,
    `auto_check` BIT(1) NOT NULL DEFAULT b'0',
    `description` VARCHAR(200) NULL,
    `score` TINYINT NOT NULL,

    INDEX `exam_id`(`exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parents` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `pesel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `reset_password_token` VARCHAR(256) NULL,
    `reset_password_expires` TIMESTAMP(0) NULL,

    UNIQUE INDEX `pesel`(`pesel`),
    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `phone_number`(`phone_number`),
    UNIQUE INDEX `reset_password_token`(`reset_password_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `problem_types_exams` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `problems_exams` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `problem_type_id` BINARY(16) NOT NULL,
    `reporter_id` BINARY(16) NOT NULL,
    `status_id` BINARY(16) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `date_reported` TIMESTAMP(0) NOT NULL DEFAULT (now()),

    INDEX `problem_type_id`(`problem_type_id`),
    INDEX `status_id`(`status_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statuses` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_closed_answers` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `student_id` BINARY(16) NOT NULL,
    `closed_question_id` BINARY(16) NOT NULL,
    `closed_answer_id` BINARY(16) NOT NULL,
    `attempt_id` BINARY(16) NOT NULL,
    `correctness` BIT(1) NULL,
    `date_time` TIMESTAMP(0) NULL DEFAULT (now()),

    INDEX `attempt_id`(`attempt_id`),
    INDEX `closed_answer_id`(`closed_answer_id`),
    INDEX `closed_question_id`(`closed_question_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_open_answers` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `open_question_id` BINARY(16) NOT NULL,
    `score` TINYINT NULL,
    `student_id` BINARY(16) NOT NULL,
    `attempt_id` BINARY(16) NOT NULL,
    `date_time` TIMESTAMP(0) NULL,
    `description` VARCHAR(255) NULL,

    INDEX `attempt_id`(`attempt_id`),
    INDEX `open_question_id`(`open_question_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students_exams` (
    `students_id` BINARY(16) NOT NULL,
    `exam_id` BINARY(16) NOT NULL,

    INDEX `exam_id`(`exam_id`),
    PRIMARY KEY (`students_id`, `exam_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students_parents` (
    `student_id` BINARY(16) NOT NULL,
    `parent_id` BINARY(16) NOT NULL,

    INDEX `parent_id`(`parent_id`),
    PRIMARY KEY (`student_id`, `parent_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers_subjects` (
    `teacher_id` BINARY(16) NOT NULL,
    `subject_id` BINARY(16) NOT NULL,

    INDEX `subject_id`(`subject_id`),
    PRIMARY KEY (`teacher_id`, `subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_types` (
    `id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `attempts` ADD CONSTRAINT `attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `attempts` ADD CONSTRAINT `attempts_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `classes_exams` ADD CONSTRAINT `classes_exams_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `classes_exams` ADD CONSTRAINT `classes_exams_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `closed_answers` ADD CONSTRAINT `closed_answers_ibfk_1` FOREIGN KEY (`closed_question_id`) REFERENCES `closed_questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `closed_questions` ADD CONSTRAINT `closed_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `files_repository` ADD CONSTRAINT `files_repository_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grades_exams` ADD CONSTRAINT `grades_exams_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grades_exams` ADD CONSTRAINT `grades_exams_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grading_scale` ADD CONSTRAINT `grading_scale_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `open_answers` ADD CONSTRAINT `open_answers_ibfk_1` FOREIGN KEY (`open_question_id`) REFERENCES `open_questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `open_questions` ADD CONSTRAINT `open_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `problems_exams` ADD CONSTRAINT `problems_exams_ibfk_1` FOREIGN KEY (`problem_type_id`) REFERENCES `problem_types_exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `problems_exams` ADD CONSTRAINT `problems_exams_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `statuses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_closed_answers` ADD CONSTRAINT `student_closed_answers_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_closed_answers` ADD CONSTRAINT `student_closed_answers_ibfk_2` FOREIGN KEY (`closed_question_id`) REFERENCES `closed_questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_closed_answers` ADD CONSTRAINT `student_closed_answers_ibfk_3` FOREIGN KEY (`closed_answer_id`) REFERENCES `closed_answers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_closed_answers` ADD CONSTRAINT `student_closed_answers_ibfk_4` FOREIGN KEY (`attempt_id`) REFERENCES `attempts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_open_answers` ADD CONSTRAINT `student_open_answers_ibfk_1` FOREIGN KEY (`open_question_id`) REFERENCES `open_questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_open_answers` ADD CONSTRAINT `student_open_answers_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `student_open_answers` ADD CONSTRAINT `student_open_answers_ibfk_3` FOREIGN KEY (`attempt_id`) REFERENCES `attempts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_exams` ADD CONSTRAINT `students_exams_ibfk_1` FOREIGN KEY (`students_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_exams` ADD CONSTRAINT `students_exams_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_parents` ADD CONSTRAINT `students_parents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `students_parents` ADD CONSTRAINT `students_parents_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers_subjects` ADD CONSTRAINT `teachers_subjects_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `teachers_subjects` ADD CONSTRAINT `teachers_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
