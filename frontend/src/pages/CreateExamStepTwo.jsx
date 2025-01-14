import React, { useContext, useState } from "react";
import PageTitle from "../components/PageTitle";
import Stepper from "../components/Stepper";
import Button from "../components/Button";
import Question from "../components/Question";
import { ExamCreationContext } from "../contexts/ExamCreationContext";
import { useNavigate } from "react-router-dom";
import { Plus } from 'lucide-react';
import { toast } from "react-toastify";

export function CreateExamStepTwo({ isEditing, onCancel, onSave, isSaving }) {
  const { 
    examData, 
    addQuestion, 
    removeQuestion, 
    updateQuestion, 
    resetExamData, 
    examId, 
    loading, 
    error 
  } = useContext(ExamCreationContext);
  
  const [errorQuestions, setErrorQuestions] = useState(null);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleNext = () => {
    if (validateQuestionCount() && validateQuestions()) {
      if (isEditing) {
        navigate(`/update-exam/${examId}`);
      } else {
        navigate('/create-exam/s3');
      }
    }
  };

  const handleSave = () => {
    if (validateQuestionCount() && validateQuestions()) {
      resetExamData();
      onSave(examData);
    } 
  };

  const handleCancel = () => {
    resetExamData();
    if (onCancel) {
      onCancel();
    } else {
      navigate('/');
    }
  };

  const handlePrevious = () => {
    navigate('/create-exam/s1');
  };

  const validateQuestionCount = () => {
    if (examData.questions.length < examData.questionsCount) {
      setErrorQuestions(true);
      toast.error('The number of questions must be greater than or equal to the required count.');
      return false;
    }
    return true;
  };

  const validateQuestions = () => {
    let isValid = true;
    examData.questions.forEach((question) => {
      if (!validateQuestionText(question)) {
        isValid = false;
      }
      if (!validateQuestionAnswers(question)) {
        isValid = false;
      }
    });
    return isValid;
  }

  const validateQuestionText = (question) => {
    if (!question.text || question.text.trim().length === 0) {
      setErrorQuestions(true);
      toast.error('Question text cannot be empty.');
      return false;
    }
    return true;
  }

  const validateQuestionAnswers = (question) => {
    if (question.answerType === 'Long Answer'){
      return true;
    }

    if (question.answerType === 'Auto Check'){
      if (!question.answer || question.answer.trim().length === 0){
        setErrorQuestions(true);
        toast.error('Answer cannot be empty for Auto Check questions.');
        return false;
      }
      return true;
    }

    if (question.answerType === 'Single Choice' || question.answerType === 'Multiple Choice'){
      if (!question.options || question.options.length === 0){
        setErrorQuestions(true);
        toast.error('At least one option is required.');
        return false;
      } else {
        for (let option of question.options) {
          if (!option.text || option.text.trim().length === 0){
            setErrorQuestions(true);
            toast.error('Option text cannot be empty.');
            return false;
          }
        }
      }
    }
    
    if (question.answerType === 'Single Choice') {
      const correctOptions = question.options.filter(opt => opt.correct);
      if (correctOptions.length !== 1) {
        setErrorQuestions(true);
        toast.error('There must be exactly one correct option for Single Choice questions.');
        return false;
      }
    }

    if (question.answerType === 'Multiple Choice') {
      const correctOptions = question.options.filter(opt => opt.correct);
      if (correctOptions.length < 1) {
        setErrorQuestions(true);
        toast.error('There must be at least one correct option for Multiple Choice questions.');
        return false;
      }
    }

    return true;
  }

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text={isEditing ? "Edit Exam - Step 2: Edit Questions" : "Create Exam"} />
      <Stepper currentStep={1} totalSteps={5}/>

      <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8 gap-8">
        {loading ? (
          <p className="text-gray-500">Loading questions...</p>
        ) : (
          <>
            {examData.questions && examData.questions.length > 0 ? (
              examData.questions.map((question, index) => (
                <Question
                  key={question.id}
                  number={index + 1}
                  question={question}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                  questionErrors={errors[question.id] || {}}
                />
              ))
            ) : (
              <p className="text-textBg-700">No questions added yet.</p>
            )}
            <Button
              onClick={() => {
                addQuestion();
                validateQuestionCount();
              }}
              size="m"
              text="Add Question"
              icon={<Plus size={16}/>}
              className="w-fit"
              type="secondary"
            />
          </>
        )}
      </div>

      <div className="flex mt-8 gap-4 sm:gap-8 justify-end">
        <Button
          size="xl"
          text={isEditing ? "Cancel" : "Previous"}
          type="secondary"
          disabled={loading || isSaving}
          className={"max-[380px]:min-w-24 max-[380px]:w-24"}
          onClick={isEditing ? handleCancel : handlePrevious}
        />
        <Button
          size="xl"
          text={(isEditing && isSaving) ? "Saving..." : isEditing ? "Save" : "Next"}
          disabled={loading || isSaving}
          type="primary"
          className={"max-[380px]:min-w-24 max-[380px]:w-24"}
          onClick={isEditing ? handleSave : handleNext}
        />
      </div>
    </main>
  );
}

export default CreateExamStepTwo;
