import React, { useContext, useState } from "react";
import PageTitle from "../components/PageTitle";
import Stepper from "../components/Stepper";
import Button from "../components/Button";
import ExamTag from "../components/ExamTag";
import TagClassStudent from "../components/TagClassStudent";
import { ScrollText, Clock3 } from "lucide-react";
import Switch from "../components/Switch";
import { ExamCreationContext } from "../contexts/ExamCreationContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function CreateExamStepFive(){
  const { examData, resetExamData } = useContext(ExamCreationContext);
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const selectedGradebookExam = examData.gradebookExams.find(
    (exam) => String(exam.lesson_id) === String(examData.selectedLessonId)
  );
  const displayedTopic = selectedGradebookExam ? selectedGradebookExam.topic : "No topic found";

  const handleCancel = () => {
    navigate('/create-exam/s4');
  };

  const handleCreate = async () => {
    try {
      setCreating(true);

      console.log(examData.startDateTime)
      console.log(examData.endDateTime)
      const startDateTimeCombined = `${examData.startDateTime}T${examData.startTime}:00.000Z`;
      const endDateTimeCombined = `${examData.endDateTime}T${examData.endTime}:00.000Z`;
      
  
      const createExamResponse = await fetch("http://localhost:3000/exams/createExam", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: examData.title,
          lesson_id: examData.selectedLessonId,
          start_date_time: startDateTimeCombined,
          end_date_time: endDateTimeCombined,
          visibility: examData.visibility,
          number_of_questions: examData.questionsCount,
          duration: examData.duration,
          description: examData.description,
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
        }),
      });
  
      if (!createExamResponse.ok) {
        const errorData = await createExamResponse.json();
        const errorMessage = errorData.message || `Failed to create exam. Status code: ${createExamResponse.status}`;
        throw new Error(errorMessage);
      }
      const createExamResult = await createExamResponse.json();
      const examId = createExamResult.data.id;
  
      const classIds = examData.selectedClasses.map(cls => cls.value);
      const studentIds = examData.selectedStudents.map(student => student.value);
      const assignParticipantsResponse = await fetch(`http://localhost:3000/exams/${examId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          classes: classIds,
          students: studentIds,
        }),
      });
  
      if (!assignParticipantsResponse.ok) {
        const errorData = await assignParticipantsResponse.json();
        const errorMessage = errorData.message || `Failed to assign participants. Status code: ${assignParticipantsResponse.status}`;
        throw new Error(errorMessage);
      }
  
      const openQuestions = examData.questions
        .filter(q => q.answerType === 'Auto Check' || q.answerType === 'Long Answer')
        .map(q => ({
          description: q.text,
          score: q.points,
          auto_check: q.autoCheck,
          answers: q.options.map(opt => ({
            description: q.answer
          })),
        }));

        console.log(openQuestions);

      const closedQuestions = examData.questions
        .filter(q => q.answerType === 'Multiple Choice' || q.answerType === 'Single Choice')
        .map(q => ({
          description: q.text,
          score: q.points,
          is_multiple: q.answerType === 'Multiple Choice' ?  true : false,
          answers: q.options.map(opt => ({
            description: opt.text,
            is_correct: opt.correct,
          })),
        }));
        console.log(closedQuestions);

      const addQuestionsResponse = await fetch(`http://localhost:3000/exams/${examId}/addquestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          open_questions: openQuestions,
          closed_questions: closedQuestions,
        }),
      });
      console.log(addQuestionsResponse);
  
      if (!addQuestionsResponse.ok) {
        const errorData = await addQuestionsResponse.json();
        const errorMessage = errorData.message || `Failed to add questions. Status code: ${addQuestionsResponse.status}`;
        throw new Error(errorMessage);
      }
  
      navigate('/create-exam/s6');
      resetExamData();
      toast.success("Exam created successfully!");
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error(error.message || "Error creating exam:");
    } finally {
      setCreating(false);
    }
  };

  console.log(examData);
  return(
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Create Exam" />
      <Stepper currentStep={4}/>
      
      <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8">
        <p className="text-2xl text-primary-500 font-bold">Basic Information</p>
        
        <label className="text-xl text-textBg-700 mt-2">{displayedTopic}</label>
        <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-center mt-8 mb-4">
            <p className="font-bold text-xl text-textBg-700">{examData.title || "Exam Name"}</p>
            <p className="text-sm text-textBg-700">{examData.startDateTime && examData.endDateTime 
                ? `${new Date(examData.startDateTime).toLocaleString()} - ${new Date(examData.endDateTime).toLocaleString()}` 
                : "Date and time are not set"}</p>
        </div>
        
        <p className="text-xl flex-row text-textBg-700 webkit-box webkit-line-clamp-4 webkit-box-orient-vertical overflow-hidden"> {examData.description || "The exam description has not been added."}
        </p>

        <div className='flex gap-4 flex-wrap mt-4'> 
        <ExamTag text={`${examData.questionsCount} questions`} icon={<ScrollText size={16} />} />
        <ExamTag text={`${examData.duration} min`} icon={<Clock3 size={16} />} />
          </div>      
      </div>


      <div className="flex flex-col border border-solid rounded border-textBg-200 mt-8 p-4 sm:p-8">
        <p className="text-2xl text-primary-500 font-bold">Questions</p>
        {examData.questions.length > 0 ? (
          <div className="mt-4">
            {examData.questions.map((question, index) => (
              <div key={question.id} className="mb-4 p-4 border rounded">
                <div className="flex gap-1 flex-col-reverse sm:gap-0 sm:flex-row sm:items-center justify-between">
                  <p className="font-bold text-xl text-textBg-900">Question {index + 1}</p>
                  <p className="text-sm text-textBg-700">{question.answerType}</p>
                </div>
                <p className="text-lg font-medium text-textBg-900 mt-2 mb-2">{question.text || "Question text not provided."}</p>

                <div className="flex flex-col gap-[2px]">
                  {question.options.map((option, index) => (
                    <div key={option.id} className="flex gap-1 items-center">
                      <p className="text-textBg-700 font-medium">{index}.</p>
                      <p className="text-textBg-700">{option.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-textBg-700">No questions added.</p>
        )}
      </div>


      <div className="flex flex-col border border-solid rounded border-textBg-200 mt-8 p-4 sm:p-8">
        <p className="text-2xl text-primary-500 font-bold">Access To Test</p>
        <p className="mt-8 font-bold text-textBg-700 text-xl">Classes added</p>
        <div className="mt-4 mb-6 flex flex-wrap gap-6">
          {examData.selectedClasses.length > 0 ? (
            examData.selectedClasses.map((cls) => (
              <TagClassStudent 
                key={cls.value} 
                text={cls.label} 
              /> 
            ))
          ) : (
            <p className="text-textBg-700">No classes added.</p>
          )}
        </div>
        <p className="mt-8 font-bold text-textBg-700 text-xl">Students added</p>
        <div className="mt-4 flex flex-wrap gap-6">
          {examData.selectedStudents.length > 0 ? (
            examData.selectedStudents.map((student) => (
              <TagClassStudent 
                key={student.value} 
                text={student.label} 
              /> 
            ))
          ) : (
            <p className="text-textBg-700">No students added.</p>
          )}
        </div>
      </div>

      
      <div className="flex flex-col border border-solid rounded border-textBg-200 mt-8 p-4 sm:p-8">
        <p className="text-2xl text-primary-500 font-bold">Settings</p>
        <div className="mt-4 flex flex-wrap gap-6">
            <Switch text="Randomly change the order of the questions" isOn={examData.randomiseQuestions} disabled />
            <Switch text="Randomly change the order of answers" isOn={examData.randomiseAnswers} disabled  />
            <Switch text="Block the ability to copy and paste text" isOn={examData.blockCopyingPasting} disabled />
            <Switch text="Set a Time Limit for Each Question" isOn={examData.timeLimitForEachQuestion } disabled />
            <Switch text="End test when the user leaves the window" isOn={examData.endTestAfterLeavingWindow} disabled/>

            <Switch text="Hides the test results when the test is finished" isOn={examData.hideResults} disabled  />
            <Switch text="Displays the number of points for each question" isOn={examData.displayPointsPerQuestion} disabled  />
            <Switch text="Show the correct answers when reviewing" isOn={examData.showCorrectAnswers} disabled />
            
            <Switch text="Allow the user to return to previous questions" isOn={examData.allowNavigation} disabled  />
            <Switch text="Allow the user to review the test after completion" isOn={examData.allowReview} disabled   />
            <Switch text="Allow the user to attempt the test multiple times" isOn={examData.multipleTries} disabled  />
            {/* <NumberInput className={"w-32 mt-4"} value={examData.numberOfTries} onChange={handleNumberChange('numberOfTries')} min={1} defaultValue={1} /> */}

      </div>
      </div>
      <div className="flex mt-8 gap-4 sm:gap-8 justify-end">
        <Button 
          size="xl" 
          text="Cancel" 
          type="secondary" 
          className={"max-[380px]:min-w-24 max-[380px]:w-24"} 
          onClick={handleCancel} 
          disabled={creating}
        />
        <Button 
          size="xl" 
          text={creating ? "Creating..." : "Create"} 
          type="primary" 
          className={"max-[380px]:min-w-24 max-[380px]:w-24"} 
          onClick={handleCreate}
          disabled={creating}
        />
      </div>

    </main>
  );
}

export default CreateExamStepFive;