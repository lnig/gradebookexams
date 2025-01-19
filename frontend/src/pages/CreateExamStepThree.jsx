import React, { useState, useEffect, useContext, useRef } from "react";
import PageTitle from "../components/PageTitle";
import Stepper from "../components/Stepper";
import Button from "../components/Button";
import Switch from "../components/Switch";
import TagClassStudent from "../components/TagClassStudent";
import Select from "react-select";
import { ExamCreationContext } from "../contexts/ExamCreationContext";
import { useNavigate } from "react-router-dom";

export function CreateExamStepThree({ onCancel, onSave, isEditing, isSaving, saveError }) {
  const { 
    examData, 
    addSelectedClass, 
    removeSelectedClass, 
    addSelectedStudent, 
    removeSelectedStudent,
    fetchParticipantsForNewExam,
    resetExamData,
  } = useContext(ExamCreationContext);

  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isClassSwitchOn, setIsClassSwitchOn] = useState(false);
  const [isStudentSwitchOn, setIsStudentSwitchOn] = useState(false);
  const hasFetched = useRef(false);
  const navigateCreate = useNavigate();

  const handleCancel = () => {
    resetExamData();
    onCancel();
  };

  const handleSave = () => {
    resetExamData();
    onSave();
  };

  useEffect(() => {
    if (!isEditing && !hasFetched.current) {
      fetchParticipantsForNewExam();
      hasFetched.current = true;
    }
  }, [isEditing, fetchParticipantsForNewExam]);

  useEffect(() => {
    setAvailableClasses(
      examData.availableClasses.filter(
        (cls) => !examData.selectedClasses.some((selected) => selected.value === cls.value)
      )
    );
    setAvailableStudents(
      examData.availableStudents.filter(
        (student) => !examData.selectedStudents.some((selected) => selected.value === student.value)
      )
    );
  }, [examData.availableClasses, examData.availableStudents, examData.selectedClasses, examData.selectedStudents]);

  const handleAddClass = (selectedOption) => {
    if (selectedOption && !examData.selectedClasses.some((cls) => cls.value === selectedOption.value)) {
      addSelectedClass(selectedOption);
    }
  };

  const handleAddStudent = (selectedOption) => {
    if (selectedOption && !examData.selectedStudents.some((student) => student.value === selectedOption.value)) {
      addSelectedStudent(selectedOption);
    }
  };

  const handleRemoveClass = (classId) => removeSelectedClass(classId);
  const handleRemoveStudent = (studentId) => removeSelectedStudent(studentId);

  const handlePrevious = () => navigateCreate("/create-exam/s2");
  const handleNext = () => navigateCreate("/create-exam/s4");

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text={isEditing ? "Edit Exam - Participants" : "Create Exam"} />
      <Stepper currentStep={2} totalSteps={5} />

      <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8 gap-8">
        <p className="text-2xl text-textBg-700 font-bold">Access To Test</p>

        <Switch
          text="Add class to the test"
          isOn={isClassSwitchOn}
          onToggle={setIsClassSwitchOn}
          disabled={isSaving}
        />
        {isClassSwitchOn && (
          <div className="p-6 ml-0 bg-textBg-150 rounded">
            <p className="text-textBg-700 text-xl w-full">
              Which class do you want to add to the test?
            </p>
            <div className="flex flex-col w-full items-center mt-4">
              <div className="w-full">
                <Select
                  options={availableClasses}
                  onChange={handleAddClass}
                  placeholder="Select a class"
                  className="w-full sm:w-64"
                />
              </div>
              <p className="text-textBg-700 text-lg w-full mt-8">Classes added:</p>
              <div className="flex w-full gap-4 flex-wrap cursor-pointer mt-4">
                {examData.selectedClasses.map((cls) => (
                  <TagClassStudent
                    key={cls.value}
                    text={cls.label}
                    onRemove={() => handleRemoveClass(cls.value)}
                    removable
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <Switch
          text="Add student to the test"
          isOn={isStudentSwitchOn}
          onToggle={setIsStudentSwitchOn}
          disabled={isSaving}
        />
        {isStudentSwitchOn && (
          <div className="p-6 ml-0 bg-textBg-150 rounded">
            <p className="text-textBg-700 text-xl w-full">
              Which student do you want to add to the test?
            </p>
            <div className="flex flex-col w-full items-center mt-4">
              <div className="w-full">
                <Select
                  options={availableStudents}
                  onChange={handleAddStudent}
                  placeholder="Select a student"
                  className="w-full sm:w-64"
                />
              </div>
              <p className="text-textBg-700 text-lg w-full mt-8">Students added:</p>
              <div className="flex w-full gap-4 flex-wrap cursor-pointer mt-4">
                {examData.selectedStudents.map((student) => (
                  <TagClassStudent
                    key={student.value}
                    text={student.label}
                    onRemove={() => handleRemoveStudent(student.value)}
                    removable
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex mt-8 gap-4 sm:gap-8 justify-end">
        <Button
          size="xl"
          text={isEditing ? "Cancel" : "Previous"}
          type="secondary"
          disabled={isSaving}
          className={"max-[380px]:min-w-24 max-[380px]:w-24"}
          onClick={isEditing ? handleCancel : handlePrevious}
        />
        <Button
          size="xl"
          text={(isEditing && isSaving) ? "Saving..." : isEditing ? "Save" : "Next"}
          disabled={isSaving}
          type="primary"
          className={"max-[380px]:min-w-24 max-[380px]:w-24"}
          onClick={isEditing ? handleSave : handleNext}
        />
      </div>
    </main>
  );
}

export default CreateExamStepThree;
