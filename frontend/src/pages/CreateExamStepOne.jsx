import React, { useContext, useState, useEffect } from "react";
import PageTitle from "../components/PageTitle";
import Stepper from "../components/Stepper";
import Button from "../components/Button";
import NumberInput from "../components/NumberInput";
import { ExamCreationContext } from "../contexts/ExamCreationContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export function CreateExamStepOne({ onCancel, onSave, isEditing, isSaving }) {
  const { 
    examData, 
    updateExamData, 
    resetExamData, 
    fetchGradebookExams,
    loading,
    isEditing: contextIsEditing,
  } = useContext(ExamCreationContext);
  const [error, setError] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let fieldValue = value;
    if (type === 'checkbox') {
      fieldValue = checked;
    }

    updateExamData({ [name]: fieldValue });
  };

  const handleLessonChange = (e) => {
    const selectedLessonId = e.target.value;
    console.log("Selected Lesson ID:", selectedLessonId);

    updateExamData({ ["selectedLessonId"]: selectedLessonId });
  };

  const handleCancel = () => {
    if (onCancel) {
      resetExamData();
      onCancel();
    } else {
      resetExamData();
      navigate('/');
    }
  };

  const handleNext = () => {
    if (validateFillInputs() && validateTitle() && validateDescription() && 
        validateDateAndTime() && validateDuration() && validateLessonSelection()) {
      navigate(contextIsEditing ? `/update-exam/${examData.id}/s2` : '/create-exam/s2');
    }
  };

  const handleSave = () => {
    if (validateFillInputs() && validateTitle() && validateDescription() && 
        validateDateAndTime() && validateDuration() && validateLessonSelection()) {
      resetExamData();
      onSave(examData);
    }
  };

  const validateFillInputs = () => {
    if (!examData.title.trim() || !examData.description.trim() ||
        !examData.questionsCount || !examData.duration ||
        !examData.startDateTime || !examData.endDateTime ||
        !examData.startTime || !examData.endTime || 
        !examData.selectedLessonId) {
      setError(true);
      toast.error('Fill in all fields');
      return false;
    }
    return true;
  };
  
  const validateTitle = () => {
    if (examData.title.trim().length < 6) {
      setError(true);
      toast.error('Title must be longer than 5 characters.');
      return false;
    }
    return true;
  };

  const validateLessonSelection = () => {
    if (!examData.selectedLessonId) {
      setError(true);
      toast.error('Please select a lesson.');
      return false;
    }
    return true;
  };
  
  const validateDescription = () => {
    if (examData.description.trim().length < 21) {
      setError(true);
      toast.error('Description must be longer than 20 characters.');
      return false;
    }
    return true;
  };
  
  const validateDateAndTime = () => {
    if (examData.startDateTime > examData.endDateTime || 
        (examData.startDateTime === examData.endDateTime && examData.startTime > examData.endTime)) {
      setError(true);
      toast.error('Start date and time cannot be after end date and time.');
      return false;
    }
    return true;
  };
  
  const validateDuration = () => {
    if (examData.startDateTime === examData.endDateTime &&
        (timeToMinutes(examData.endTime) - timeToMinutes(examData.startTime) < examData.duration)) {
      setError(true);
      toast.error('The specified time is insufficient to accommodate the exam duration.');
      return false;
    }
    return true;
  };


  useEffect(() => {
    if (!contextIsEditing) {
      fetchGradebookExams()
        .then(() => {
        })
        .catch(error => {
          toast.error("Failed to retrieve gradebook exams.");
        });
    }
    console.log("useeffect")
    console.log(examData.selectedLessonId)
  }, [fetchGradebookExams, contextIsEditing]);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text={contextIsEditing ? "Edit Exam - Basic Information" : "Create Exam"} />
      <Stepper currentStep={0} totalSteps={5}/>
      <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8 gap-8">
        <p className="text-2xl text-textBg-700 font-bold">Information</p>

        <div className="flex flex-col gap-3">
          <label className="text-xl text-textBg-700">Gradebook Exam Topic</label>

          <select
            name="selectedLessonId"
            id="selectedLessonId"
            value={examData.selectedLessonId || ""}
            onChange={handleLessonChange}
            disabled={isSaving || examData.gradebookExams.length === 0}
            className="w-full h-10 px-3 text-base text-textBg-700 border rounded border-textBg-400 focus:outline-none focus:border-textBg-500 disabled:bg-gray-200"
            required
          >
            {!contextIsEditing && (
              <option value="" disabled hidden>
                Select a topic
              </option>
            )}

            {examData.gradebookExams.map(ex => (
              <option key={ex.lesson_id} value={String(ex.lesson_id)}>
                {ex.topic}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xl text-textBg-700">Exam Title</label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="New Test"
            value={examData.title}
            onChange={handleChange}
            onBlur={validateTitle}
            disabled={isSaving}
            className="w-full h-10 px-3 text-base text-textBg-700 border rounded border-textBg-400 focus:outline-none focus:border-textBg-500 disabled:bg-gray-200"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xl text-textBg-700">Exam Description</label>
          <textarea
            name="description"
            id="description"
            placeholder="Description"
            value={examData.description}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full px-3 py-2 min-h-24 text-base text-textBg-700 border rounded border-textBg-400 focus:outline-none focus:border-textBg-500 disabled:bg-gray-200"
          ></textarea>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          <div className="flex flex-col gap-3">
            <label className="text-xl text-textBg-700">Questions</label>
            <NumberInput
              name="questionsCount"
              id="questionsCount"
              className={"w-40"}
              minValue={1}
              maxValue={5}
              defaultValue={1}
              value={examData.questionsCount}
              onChange={(value) => updateExamData({ questionsCount: value })}
              disabled={isSaving}
            />      
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xl text-textBg-700">Duration (min)</label>
            <NumberInput
              name="duration"
              id="duration"
              className={"w-40 sm:w-32"}
              minValue={1}
              maxValue={999}
              value={examData.duration}
              onChange={(value) => updateExamData({ duration: value })}
              disabled={isSaving}
            />      
          </div>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          <div className="flex flex-col gap-3">
            <label className="text-xl text-textBg-700">Start Date</label>
            <input
              type="date"
              name="startDateTime"
              id="startDateTime"
              value={examData.startDateTime}
              onChange={handleChange}
              disabled={isSaving}
              className="w-40 h-10 px-3 text-base text-textBg-700 border rounded bg-white border-textBg-400 focus:outline-none focus:border-textBg-500 disabled:bg-gray-200"
            />      
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xl text-textBg-700">Start Time</label>
            <input
              type="time"
              name="startTime"
              id="startTime"
              value={examData.startTime}
              onChange={handleChange}
              disabled={isSaving}
              className="w-40 sm:w-32 h-10 px-3 text-base text-textBg-700 border rounded bg-white border-textBg-400 focus:outline-none focus:border-textBg-500 disabled:bg-gray-200"
            />     
          </div>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          <div className="flex flex-col gap-3">
            <label className="text-xl text-textBg-700">End Date</label>
            <input
              type="date"
              name="endDateTime"
              id="endDateTime"
              value={examData.endDateTime}
              onChange={handleChange}
              disabled={isSaving}
              className="appearance-none w-40 h-10 px-3 text-base text-textBg-700 border rounded bg-white border-textBg-400 focus:outline-none focus:border-textBg-500 disabled:bg-gray-200"
            />      
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xl text-textBg-700">End Time</label>
            <input
              type="time"
              name="endTime"
              id="endTime"
              value={examData.endTime}
              onChange={handleChange}
              disabled={isSaving}
              className="appearance-none w-40 sm:w-32 h-10 px-3 text-base text-textBg-700 border rounded bg-white border-textBg-400 focus:outline-none focus:border-textBg-500 disabled:bg-gray-200"
            />     
          </div>
        </div>
      </div>

      <div className="flex mt-8 gap-4 sm:gap-8 justify-end">
        <Button
          size="xl"
          text="Cancel"
          type="secondary"
          disabled={isSaving}
          className={"max-[380px]:min-w-24 max-[380px]:w-24"}
          onClick={handleCancel}
        />
        <Button
          size="xl"
          text={isSaving ? "Saving..." : contextIsEditing ? "Save" : "Next"}
          disabled={isSaving}
          type="primary"
          className={"max-[380px]:min-w-24 max-[380px]:w-24"}
          onClick={contextIsEditing ? handleSave : handleNext}
        />
      </div>
    </main>
  );
}

export default CreateExamStepOne;

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}
