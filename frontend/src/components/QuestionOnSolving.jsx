import React, { useState, useEffect } from 'react';
import Checkbox from "./Checkbox";

export default function QuestionOnSolving({ 
    number, 
    type, 
    answers, 
    value, 
    disabled,
    achieved_score,
    score, 
    description,
    attemptNumber,
    is_multiple,
    solving,
    reviewing,
    onAnswerChange, 
}) {
    const [selectedAnswers, setSelectedAnswers] = useState(() => {
        if (Array.isArray(value)) {
          return value;
        } else if (typeof value === 'string' && value.trim() !== '') {
          return [value];
        } else {
          return [];
        }
      });

      useEffect(() => {

        if (Array.isArray(value)) {
          setSelectedAnswers(value);
        } else if (typeof value === 'string' && value.trim() !== '') {
          setSelectedAnswers([value]);
        } else {
          setSelectedAnswers([]);
        }
      }, [value]);

    useEffect(() => {
    }, [selectedAnswers]);

    const getOptionLabel = (index) => {
        return String.fromCharCode(65 + index);
    };

    const handleCheckboxChange = (answerId) => {
      
        if (is_multiple) {
          let updatedAnswers;
          if (selectedAnswers.includes(answerId)) {
            updatedAnswers = selectedAnswers.filter(id => id !== answerId);
          } else {
            updatedAnswers = [...selectedAnswers, answerId];
          }
          setSelectedAnswers(updatedAnswers);
          onAnswerChange(updatedAnswers);
      
        } else {
          let updatedAnswers;
          if (selectedAnswers.includes(answerId)) {
            updatedAnswers = [];
          } else {
            updatedAnswers = [answerId];
          }
          setSelectedAnswers(updatedAnswers);
          onAnswerChange(updatedAnswers);
        }
      };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <p className="text-2xl text-textBg-700 font-bold">{number}</p>

                {score !== undefined && achieved_score === undefined && (
                    <p className="bg-primary-500 text-textBg-100 text-sm font-bold px-6 py-1 rounded-full">
                        {score} pt
                    </p>
                )}
                {score !== undefined && achieved_score !== undefined && (
                    <p className="bg-primary-500 text-textBg-100 text-sm font-bold px-6 py-1 rounded-full">
                        {achieved_score}/{score} pt
                    </p>
                )}
            </div>
            <p className="text-xl text-textBg-700 mt-3">{description}</p>
            {solving !== true && (
                <p className="text-sm text-textBg-700 mt-2">Attempt nr. {attemptNumber}</p>
            )}

            <div className="flex items-center mt-6">
                <p className="text-xl text-textBg-700">Answer</p>
                {type === 'Long' && (
                    <p className="ml-2 text-textBg-500">(Max. 100 words)</p>
                )}
            </div>
            {type === 'Long' && (
                <textarea
                    value={selectedAnswers}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    placeholder="Your Answer" 
                    className="w-full mt-3 px-3 py-2 min-h-24 text-base text-textBg-700 border rounded border-textBg-400 focus:outline-none focus:border-textBg-500"
                    disabled={disabled}
                />
            )}
            {!is_multiple && type !== 'Long' && (
                <div className="flex flex-col gap-2 mt-4">
                    {answers.map((answer, index) => (
                        <div key={answer.id} className="flex items-center gap-4">
                            <p className='hidden text-xl mr-3 w-6 sm:flex justify-end'>{getOptionLabel(index)}</p>
                            <p className={`w-full ${solving && answer.is_correct ? 'text-green-500' : ''}`}>{answer.description}</p>
                            { reviewing != undefined && (
                                <Checkbox
                                    checked={answer.selected}
                                    onChange={() => handleCheckboxChange(answer.id)}
                                    type="checkbox"
                                    disabled={disabled}
                                />
                            )}
                            { reviewing === undefined && (
                                <Checkbox
                                    checked={selectedAnswers.includes(answer.id)}
                                    onChange={() => handleCheckboxChange(answer.id)}
                                    type="checkbox"
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
            {is_multiple && type !== 'Long' && (
                <div className="flex flex-col gap-2 mt-4">
                    {answers.map((answer, index) => (
                        <div key={answer.id} className="flex items-center gap-4">
                            <p className='hidden text-xl mr-3 w-6 sm:flex justify-end'>{getOptionLabel(index)}</p>
                            <p className={`w-full ${solving && answer.is_correct ? 'text-green-500' : ''}`}>{answer.description}</p>
                            { reviewing != undefined && (
                                <Checkbox
                                    checked={answer.selected}
                                    onChange={() => handleCheckboxChange(answer.id)}
                                    type="checkbox"
                                    disabled={disabled}
                                />
                            )}
                            { reviewing === undefined && (
                                <Checkbox
                                    checked={selectedAnswers.includes(answer.id)}
                                    onChange={() => handleCheckboxChange(answer.id)}
                                    type="checkbox"
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
