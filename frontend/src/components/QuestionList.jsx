import React from 'react';
import QuestionListItem from "./QuestionListItem";

const QuestionList = ({ questions, answeredQuestions, currentQuestionIndex, disableNavigation, setCurrentQuestionIndex }) => {
    return (
        <div className="hidden md:block w-fit h-fit border border-solid rounded border-textBg-200 p-4 sm:p-8 gap-8">
            <p className="text-textBg-700 text-2xl font-bold">Question List</p>
            <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-8">
                {questions.map((question, index) => (
                    <QuestionListItem
                        key={question.id}
                        number={`${index + 1}`}
                        answered={answeredQuestions[index]}
                        onClick={() => {
                            if (disableNavigation) {
                                console.log(disableNavigation)
                              setCurrentQuestionIndex(index);
                            }
                          }}
                    />
                ))}
            </div>
            <div>
                <div className="grid grid-cols-1 xl:grid-cols-2 w-full gap-2 mt-6">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-textBg-500"></div>
                        <p className="text-textBg-700">Not Answered</p>   
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-success-600"></div>
                        <p className="text-textBg-700">Answered</p>   
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionList;
