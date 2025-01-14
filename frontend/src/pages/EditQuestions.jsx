import React, { useContext, useEffect, useState } from "react";
import { ExamCreationProvider, ExamCreationContext } from "../contexts/ExamCreationContext";
import CreateExamStepTwo from "./CreateExamStepTwo";
import { useParams, useNavigate } from "react-router-dom";
import { validate as uuidValidate } from 'uuid';
import { getToken } from "../utils/UserRoleUtils";
import { toast } from "react-toastify";

const EditQuestions = () => {
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
    alert(`Error: ${errorMessage}`);
  };

  return (
    <ExamCreationProvider examId={examId}>
      <EditQuestionsContent
        examId={examId}
        onCancel={handleCancel}
        handleSaveSuccess={handleSaveSuccess}
        handleSaveError={handleSaveError}
      />
    </ExamCreationProvider>
  );
};

const EditQuestionsContent = ({ examId, onCancel, handleSaveSuccess, handleSaveError }) => {
  const { error, fetchExamQuestions, examData, loading } = useContext(ExamCreationContext);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchExamQuestions();
  }, [fetchExamQuestions, examId]);

  if (loading) {
    return (
      <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
        <p className="flex items-center justify-center mt-8 font-medium text-xl text-gray-800">Loading questions...</p>
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

  const handleSave = async () => {
    if (!examId) {
      const errorMsg = "Missing exam ID.";
      setSaveError(errorMsg);
      handleSaveError(errorMsg);
      return;
    }

    const token = getToken();
    if (!token) {
      const errorMessage = "No authorization token. Please log in again.";
      setSaveError(errorMessage);
      handleSaveError(errorMessage);
      return;
    }

    for (const q of examData.questions) {
      console.log("question")
      console.log(q)
      if (q.answerType === 'Auto Check' && (!q.answer || !q.answer.trim())) {
        const errorMsg = `Question "${q.text}" requires an answer because auto_check is enabled.`;
        setSaveError(errorMsg);
        handleSaveError(errorMsg);
        return;
      }
    }

    const openQuestionsAutoCheck = examData.questions
    .filter(q => q.answerType === 'Auto Check')
    .map(q => ({
      id: q.id && uuidValidate(q.id) ? q.id : undefined,
      description: q.text,
      score: q.points,
      auto_check: q.autoCheck,
      answers: [{ id: undefined, description: q.answer }],
    }));

  const openQuestionsLongAnswer = examData.questions
    .filter(q => q.answerType === 'Long Answer')
    .map(q => ({
      id: q.id && uuidValidate(q.id) ? q.id : undefined,
      description: q.text,
      score: q.points,
      auto_check: q.autoCheck,
    }));

  const closedQuestionsSingle = examData.questions
    .filter(q => q.answerType === 'Single Choice')
    .map(q => ({
      id: q.id && uuidValidate(q.id) ? q.id : undefined,
      description: q.text,
      score: q.points,
      is_multiple: false,
      answers: q.options.map(a => ({
        id: a.id && uuidValidate(a.id) ? a.id : undefined,
        description: a.text,
        is_correct: a.correct,
      })),
    }));

    const closedQuestionsMultiple = examData.questions
    .filter(q => q.answerType === 'Multiple Choice')
    .map(q => ({
      id: q.id && uuidValidate(q.id) ? q.id : undefined,
      description: q.text,
      score: q.points,
      is_multiple: true,
      answers: q.options.map(a => ({
        id: a.id && uuidValidate(a.id) ? a.id : undefined,
        description: a.text,
        is_correct: a.correct,
      })),
    }));

    console.log(closedQuestionsSingle)
    console.log(closedQuestionsMultiple)

  const payload = {
    open_questions: [
      ...openQuestionsAutoCheck,
      ...openQuestionsLongAnswer,
    ],
    closed_questions: [
      ...closedQuestionsSingle,
      ...closedQuestionsMultiple,
    ],
  };

    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await fetch(`http://localhost:3000/exams/${examId}/upsertQuestionsToExam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save questions.');
      }

      const data = await response.json();
      await fetchExamQuestions();

      handleSaveSuccess();
      toast.success("Questions saved successfully.")
    } catch (error) {
      setSaveError(error.message);
      toast.error(error.message || "An unexpected error occurred.")
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {saveError && <p className="text-red-500 mb-4">{saveError}</p>}
      <CreateExamStepTwo 
        isEditing={true} 
        onCancel={onCancel}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </>
  );
};

export default EditQuestions;
