import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CreateExamStepOne from "./CreateExamStepOne";
import CreateExamStepTwo from "./CreateExamStepTwo";
import CreateExamStepThree from "./CreateExamStepThree";
import CreateExamStepFour from "./CreateExamStepFour";
import CreateExamStepFive from "./CreateExamStepFive";
import SuccessfullyCreateExam from "./SuccessfullyCreateExam";
import { ExamCreationProvider } from "../contexts/ExamCreationContext";

function CreateExam() {
  return (
    <ExamCreationProvider>
      <Routes>
        <Route path="/" element={<Navigate to="s1" replace />} />
        <Route path="s1" element={<CreateExamStepOne />} />
        <Route path="s2" element={<CreateExamStepTwo />} />
        <Route path="s3" element={<CreateExamStepThree />} />
        <Route path="s4" element={<CreateExamStepFour />} />
        <Route path="s5" element={<CreateExamStepFive />} />
        <Route path="s6" element={<SuccessfullyCreateExam />} />

        <Route path="*" element={<Navigate to="s1" replace />} />
      </Routes>
    </ExamCreationProvider>
  );
}

export default CreateExam;