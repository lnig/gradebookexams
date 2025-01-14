import React, { useContext, useState } from "react";
import { ExamCreationProvider, ExamCreationContext } from "../contexts/ExamCreationContext";
import CreateExamStepOne from "./CreateExamStepOne";
import { useParams, useNavigate } from "react-router-dom";
import { getToken } from "../utils/UserRoleUtils";
import { toast } from "react-toastify";

const EditExamBasicInfo = () => {
  const { examId } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const navigate = useNavigate();
  const token = getToken();

  const handleCancel = () => {
    navigate(`/AboutExam?exam_id=${examId}`);
  };

  const handleSave = async (examDataToSave) => {
    const startDateTimeCombined = `${examDataToSave.startDateTime}T${examDataToSave.startTime}:00.000Z`;
    const endDateTimeCombined = `${examDataToSave.endDateTime}T${examDataToSave.endTime}:00.000Z`;

    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`http://localhost:3000/exams/update/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: examDataToSave.title,
          lesson_id: examDataToSave.selectedLessonId,
          start_date_time: startDateTimeCombined,
          end_date_time: endDateTimeCombined,
          visibility: examDataToSave.visibility,
          number_of_questions: examDataToSave.questionsCount,
          duration: examDataToSave.duration,
          description: examDataToSave.description,
          number_of_tries: examDataToSave.numberOfTries,
          multiple_tries: examDataToSave.multipleTries,
          time_limit_for_each_question: examDataToSave.timeLimitForEachQuestion,
          randomise_questions: examDataToSave.randomiseQuestions,
          end_test_after_leaving_window: examDataToSave.endTestAfterLeavingWindow,
          block_copying_pasting: examDataToSave.blockCopyingPasting,
          randomise_answers: examDataToSave.randomiseAnswers,
          latest_attempt_counts: examDataToSave.latestAttemptCounts,
          best_attempt_counts: examDataToSave.bestAttemptCounts,
          hide_results: examDataToSave.hideResults,
          display_points_per_question: examDataToSave.displayPointsPerQuestion,
          show_correct_answers: examDataToSave.showCorrectAnswers,
          allow_navigation: examDataToSave.allowNavigation,
          allow_review: examDataToSave.allowReview,
          allow_return_to_previous_questions: examDataToSave.allowReturnToPreviousQuestions,
          allow_multiple_attempts: examDataToSave.allowMultipleAttempts,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error saving exam.');
      }

      navigate(`/AboutExam?exam_id=${examId}`);
      toast.success("Basic information saved successfully.")
    } catch (error) {
      setSaveError(error.message);
      toast.error(error.message || "An unexpected error occurred.")
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ExamCreationProvider examId={examId}>
      <EditExamBasicInfoContent 
        navigate={navigate} 
        handleSave={handleSave} 
        handleCancel={handleCancel} 
        isSaving={isSaving}
        saveError={saveError}
      />
    </ExamCreationProvider>
  );
};

const EditExamBasicInfoContent = ({ navigate, handleSave, handleCancel, isSaving, saveError }) => {
  const { error, loading } = useContext(ExamCreationContext);

  if (loading) {
    return (
      <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
        <p className="flex items-center justify-center mt-8 font-medium text-xl text-gray-800">Loading basic informations...</p>
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
    <>
      {saveError && <p className="text-red-500 mb-4">{saveError}</p>}
      <CreateExamStepOne 
        onCancel={handleCancel} 
        onSave={handleSave} 
        isEditing={true} 
        isSaving={isSaving} 
      />
    </>
  );
};

export default EditExamBasicInfo;
