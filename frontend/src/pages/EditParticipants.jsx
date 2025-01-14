import React, { useContext, useEffect, useState } from "react";
import { ExamCreationProvider, ExamCreationContext } from "../contexts/ExamCreationContext";
import CreateExamStepThree from "./CreateExamStepThree";
import { useParams, useNavigate } from "react-router-dom";
import { getToken } from "../utils/UserRoleUtils";
import { toast } from "react-toastify";

const EditParticipants = () => {
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
      <EditParticipantsContent
        examId={examId}
        handleCancel={handleCancel}
        handleSaveSuccess={handleSaveSuccess}
        handleSaveError={handleSaveError}
      />
    </ExamCreationProvider>
  );
};

const EditParticipantsContent = ({ examId, handleCancel, handleSaveSuccess, handleSaveError }) => {
  const { error, loading, fetchExamQuestions, fetchParticipants, examData, initialSelectedClasses, initialSelectedStudents } = useContext(ExamCreationContext);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    fetchExamQuestions();
    fetchParticipants();
  }, [fetchExamQuestions, fetchParticipants, examId]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const handleSave = async () => {
    console.log("Save Participants button clicked");

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

    const currentClasses = examData?.selectedClasses?.map(cls => cls.value) || [];
    const initialClasses = initialSelectedClasses?.map(cls => cls.value) || [];

    const classesToDelete = initialClasses.filter(cls => !currentClasses.includes(cls));
    const classesToAdd = currentClasses.filter(cls => !initialClasses.includes(cls));

    const currentStudents = examData?.selectedStudents?.map(student => student.value) || [];
    const initialStudents = initialSelectedStudents?.map(student => student.value) || [];

    const studentsToDelete = initialStudents.filter(student => !currentStudents.includes(student));
    const studentsToAdd = currentStudents.filter(student => !initialStudents.includes(student));

    const deletePayload = {
      classes: classesToDelete,
      students: studentsToDelete,
    };

    const addPayload = {
      classes: classesToAdd,
      students: studentsToAdd,
    };

    try {

      if (deletePayload.classes.length > 0 || deletePayload.students.length > 0) {
        setIsSaving(true);
        setSaveError(null);
        const deleteResponse = await fetch(`http://localhost:3000/exams/${examId}/deleteparticipants`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(deletePayload),
        });

        if (!deleteResponse.ok) {
          const errData = await deleteResponse.json();
          throw new Error(errData.message || "Failed to remove participants.");
        }
      }

      if (addPayload.classes.length > 0 || addPayload.students.length > 0) {
        setIsSaving(true);
        setSaveError(null);
        const addResponse = await fetch(`http://localhost:3000/exams/${examId}/participants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(addPayload),
        });

        if (!addResponse.ok) {
          const errData = await addResponse.json();
          throw new Error(errData.message || "Failed to add participants.");
        }
      }

      await fetchExamQuestions();
      await fetchParticipants();

      handleSaveSuccess();
      toast.success("Participants saved successfully.")
    } catch (err) {
      console.error("Error saving participants:", err);
      setSaveError(err.message);
      toast.error(err.message || "An unexpected error occurred.")
    }
  };

  if (loading) {
    return (
      <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
        <p className="flex items-center justify-center mt-8 font-medium text-xl text-gray-800">Loading participants...</p>
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
    <CreateExamStepThree 
      onCancel={handleCancel}
      onSave={handleSave}
      isEditing={true}
      isSaving={isSaving} 
    />
  );
};

export default EditParticipants;
