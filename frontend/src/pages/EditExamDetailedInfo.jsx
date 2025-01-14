import React, { useContext, useState } from "react";
import { ExamCreationProvider, ExamCreationContext } from "../contexts/ExamCreationContext";
import CreateExamStepFour from "./CreateExamStepFour";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../utils/UserRoleUtils";
import { toast } from 'react-toastify';
import { API_EXAMS_URL } from "../utils/config";

const EditExamDetailedInfo = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(`/AboutExam?exam_id=${examId}`);
  };

  const handleSaveSuccess = () => {
    navigate(`/AboutExam?exam_id=${examId}`);
  };

  const handleSaveError = (errorMessage) => {
    console.error("Save error:", errorMessage);
  };

  return (
    <ExamCreationProvider examId={examId}>
      <EditExamDetailedInfoContent
        examId={examId}
        handleCancel={handleCancel}
        handleSaveSuccess={handleSaveSuccess}
        handleSaveError={handleSaveError}
      />
    </ExamCreationProvider>
  );
};

const EditExamDetailedInfoContent = ({ examId, handleCancel, handleSaveSuccess, handleSaveError }) => {
  const { examData, error, loading } = useContext(ExamCreationContext);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const token = getToken();

  const handleSave = async () => {
    if (!examId) return;

    setIsSaving(true);
    setSaveError(null);

    if (!token) {
      const errorMessage = "No authorization token. Please log in again.";
      handleSaveError(errorMessage);
      return;
    }

    const startDateTimeCombined = `${examData.startDateTime}T${examData.startTime}:00.000Z`;
    const endDateTimeCombined = `${examData.endDateTime}T${examData.endTime}:00.000Z`;
    const payload = {
      title: examData.title,
      description: examData.description,
      start_date_time: startDateTimeCombined,
      end_date_time: endDateTimeCombined,
      number_of_questions: examData.questionsCount,
      duration: examData.duration,
      visibility: examData.visibility,
      lesson_id: examData.lesson_id,
      number_of_tries: examData.numberOfTries,
      multiple_tries: examData.multipleTries,
      time_limit_for_each_question: examData.timeLimitForEachQuestion,
      randomise_questions: examData.randomiseQuestions,
      end_test_after_leaving_window: examData.endTestAfterLeavingWindow,
      block_copying_pasting: examData.blockCopyingPasting,
      randomise_answers: examData.randomiseAnswers,
      latest_attempt_counts: examData.latestAttemptCounts,
      best_attempt_counts: examData.bestAttemptCounts,
      hide_results: examData.hideResults,
      display_points_per_question: examData.displayPointsPerQuestion,
      show_correct_answers: examData.showCorrectAnswers,
      allow_navigation: examData.allowNavigation,
      allow_review: examData.allowReview,
      allow_return_to_previous_questions: examData.allowReturnToPreviousQuestions,
      allow_multiple_attempts: examData.allowMultipleAttempts,
    };
    try {
      const response = await fetch(`${API_EXAMS_URL}/exams/update/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update exam details.");
      }

      handleSaveSuccess();
      toast.success("Settings saved successfully.")
    } catch (err) {
      handleSaveError(err.message);
      toast.error(err.message || "An unexpected error occurred.")
    }
  };

  if (loading) {
    return (
      <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
        <p className="flex items-center justify-center mt-8 font-medium text-xl text-gray-800">Loading settings...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <CreateExamStepFour
      onCancel={handleCancel}
      onSave={handleSave}
      isEditing={true}
      isSaving={isSaving}
    />
  );
};

export default EditExamDetailedInfo;
