import React from "react";
import PageTitle from "../components/PageTitle";
import Stepper from "../components/Stepper";
import Button from "../components/Button";
import Switch from "../components/Switch";
import NumberInput from "../components/NumberInput";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ExamCreationContext } from "../contexts/ExamCreationContext";

export function CreateExamStepFour({ onCancel, onSave, isEditing, isSaving }){

  const { examData, updateExamData, resetExamData } = useContext(ExamCreationContext);
  const navigate = useNavigate();

  const handlePrevious = () => {
    navigate('/create-exam/s3');
  };

  const handleCancel = () => {
    resetExamData();
    onCancel();
  };

  const handleSave = () => {
    resetExamData();
    onSave();
  };

  const handleNext = () => {
      navigate('/create-exam/s5');
  };

  const handleToggle = (field) => (value) => {
    updateExamData({ [field]: value });
  };

  const handleNumberChange = (field) => (value) => {
    updateExamData({ [field]: value });
  };

  return(
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Create Exam" />
      <Stepper currentStep={3}/>
      
      <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8 gap-8">
        <p className="text-2xl text-textBg-700 font-bold">Randomization and Security</p>

        <div className="grid 2xl:grid-cols-2 gap-y-6">
            <Switch text="Randomly change the order of the questions" isOn={examData.randomiseQuestions} onToggle={handleToggle('randomiseQuestions')} />
            <Switch text="Randomly change the order of answers" isOn={examData.randomiseAnswers} onToggle={handleToggle('randomiseAnswers')}  />

            <Switch text="Block the ability to copy and paste text" isOn={examData.blockCopyingPasting} onToggle={handleToggle('blockCopyingPasting')}  />
            
            <div>
              <Switch text="End test when the user leaves the window" isOn={examData.endTestAfterLeavingWindow} onToggle={handleToggle('endTestAfterLeavingWindow')}/>
                {/* {isLeaveWindowSwitchOn&& (
                <div className="p-4 md:p-6 mt-4 ml-20 bg-textBg-150 rounded w-fit">
                  <p className="text-textBg-700 text-lg w-full ">How many times a user can leave the page?</p>
                  <NumberInput className={"w-32 mt-4"} defaultValue={1}/>
                </div>
                )} */}
            </div>

            {/* <div>
              <Switch text="Randomize questions from a larger pool" onToggle={setIsQuestionPoolSwitchOn} />
                {isQuestionPoolSwitchOn&& (
                <div className="p-4 md:p-6 mt-4 ml-20 bg-textBg-150 rounded w-fit">
                  <p className="text-textBg-700 text-lg">Random pick __ questions</p>
                  <NumberInput className={"w-32 mt-4"} defaultValue={1}/>
                </div>
                )}
            </div>  */}
        </div>
      </div>

      <div className="flex flex-col mt-8 border border-solid rounded border-textBg-200 p-4 sm:p-8 gap-8">
        <p className="text-2xl text-textBg-700 font-bold">Feedback and Results</p>

        <div className="grid 2xl:grid-cols-2 gap-y-6">
            <Switch text="Hides the test results when the test is finished" isOn={examData.hideResults} onToggle={handleToggle('hideResults')}  />
            <Switch text="Displays the number of points for each question" isOn={examData.displayPointsPerQuestion} onToggle={handleToggle('displayPointsPerQuestion')}  />

            <Switch text="Show the correct answers when reviewing" isOn={examData.showCorrectAnswers} onToggle={handleToggle('showCorrectAnswers')} />

            <Switch text="Latest attempt counts" isOn={examData.latestAttemptCounts} onToggle={(value) => {updateExamData({latestAttemptCounts: value,bestAttemptCounts: !value ? examData.bestAttemptCounts : false,});
    }} />
            <Switch text="Best attempt counts" isOn={examData.bestAttemptCounts} onToggle={(value) => {updateExamData({bestAttemptCounts: value,latestAttemptCounts: !value ? examData.latestAttemptCounts : false,});
    }} />
        </div>
      </div>

      <div className="flex flex-col mt-8 border border-solid rounded border-textBg-200 p-4 sm:p-8 gap-8">
        <p className="text-2xl text-textBg-700 font-bold">User Experience</p>

        <div className="grid 2xl:grid-cols-2 gap-y-6">
            <Switch text="Allow the user to return to previous questions" isOn={examData.allowNavigation} onToggle={handleToggle('allowNavigation')}  />
            <Switch text="Allow the user to review the test after completion" isOn={examData.allowReview} onToggle={handleToggle('allowReview')}   />

            <div>
              <Switch text="Allow the user to attempt the test multiple times" isOn={examData.multipleTries} onToggle={handleToggle('multipleTries')}  />
              {examData.multipleTries && (
                  <div className="p-4 md:p-6 mt-4 ml-20 bg-textBg-150 rounded w-fit">
                    <p className="text-textBg-700 text-lg">How many times a user can attempt to the test?</p>
                    <NumberInput className={"w-32 mt-4"} value={examData.numberOfTries} onChange={handleNumberChange('numberOfTries')} minValue={1} maxValue={999} defaultValue={1} />
                  </div>
              )}
            </div>
        </div>
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


export default CreateExamStepFour;