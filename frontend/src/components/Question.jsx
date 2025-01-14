/* eslint-disable react/prop-types */
import React from 'react';
import NumberInput from './NumberInput';
import Button from './Button';
import { Plus, Trash } from 'lucide-react';
import Checkbox from './Checkbox';

export default function Question({
  number,
  question,
  updateQuestion,
  removeQuestion,
  questionErrors
}) {
  const { id, text, answerType, options, points, words, maxWords, autoCheck, answer } = question;

  const handleAnswerTypeChange = (event) => {
    const newAnswerType = event.target.value;
    const isAutoCheck = newAnswerType === 'Auto Check';
    updateQuestion(id, { answerType: newAnswerType, autoCheck: isAutoCheck });

    if (newAnswerType === 'Single Choice' || newAnswerType === 'Multiple Choice') {
      const updatedOptions = options.map(option => ({ ...option, correct: false }));
      updateQuestion(id, { options: updatedOptions });
    }
  };

  const handleAnswerChange = (e) => {
    const newAnswer = e.target.value;
    updateQuestion(id, { answer: newAnswer });
  };

  const handleOptionTextChange = (index, optionText) => {
    const newOptions = [...options];
    newOptions[index].text = optionText;
    updateQuestion(id, { options: newOptions });
  };

  const handleCorrectChange = (index) => {
    if (answerType === 'Single Choice') {
      const newOptions = options.map((option, i) => ({ ...option, correct: i === index }));
      updateQuestion(id, { options: newOptions });
    } else {
      const newOptions = [...options];
      newOptions[index].correct = !newOptions[index].correct;
      updateQuestion(id, { options: newOptions });
    }
  };

  const handleAddOption = () => {
    const newOptions = [...options, { text: '', correct: false }];
    updateQuestion(id, { options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    updateQuestion(id, { options: newOptions });
  };

  const handleQuestionTextChange = (e) => {
    const newText = e.target.value;
    updateQuestion(id, { text: newText });
  };

  const handlePointsChange = (value) => {
    updateQuestion(id, { points: value });
  };

  const handleWordsChange = (value) => {
    updateQuestion(id, { words: value });
  };

  const handleMaxWordsChange = (value) => {
    updateQuestion(id, { maxWords: value });
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div id={id}>
      <div className="flex justify-between items-center mb-8">
        <p className="text-2xl text-textBg-700 font-bold">Question {number}</p>
        <Button type="link" icon={<Trash />} onClick={() => removeQuestion(id)} />
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
        <div className="flex flex-col gap-3 w-full">
          <label className="text-xl text-textBg-700">Question</label>
          <input
            type="text"
            placeholder="Enter question text"
            value={text}
            onChange={handleQuestionTextChange}
            className={`w-full h-10 px-3 text-base text-textBg-700 border rounded border-textBg-400 
              focus:outline-none focus:border-textBg-500 ${
                questionErrors.text ? 'border-red-500' : ''
              }`}
          />
          {questionErrors.text && (
            <p className="text-red-500 text-sm mt-1">{questionErrors.text}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xl text-textBg-700">Answer Type</label>
          <select
            className="w-full sm:w-fit h-10 px-3 text-base text-textBg-700 border rounded 
              border-textBg-400 focus:outline-none focus:border-textBg-500 bg-white"
            value={answerType}
            onChange={handleAnswerTypeChange}
          >
            <option>Auto Check</option>
            <option>Long Answer</option>
            <option>Single Choice</option>
            <option>Multiple Choice</option>
          </select>
        </div>
      </div>

      {answerType !== 'Long Answer' && (
        <div className="flex flex-col gap-3">
          <label className="text-xl text-textBg-700 mt-8">Answers</label>
        </div>
      )}

      <div className="mt-4">
        {answerType === 'Auto Check' && (
          <div>
            <input
              type="text"
              placeholder="Enter the correct answer"
              value={answer || ''}
              onChange={handleAnswerChange}
              className={`w-full h-10 px-3 text-base text-textBg-700 border rounded border-textBg-400 
                focus:outline-none focus:border-textBg-500 ${
                  questionErrors.answer ? 'border-red-500' : ''
                }`}
            />
            {questionErrors.answer && (
              <p className="text-red-500 text-sm mt-1">{questionErrors.answer}</p>
            )}

            <div className="flex flex-col gap-8 sm:flex-row sm:gap-16 mt-8">
              <div className="flex flex-col gap-3">
                <label className="text-xl text-textBg-700">Points</label>
                <NumberInput
                  className={"w-32"}
                  value={points}
                  onChange={handlePointsChange}
                  minValue={1}
                  maxValue={999}
                />
              </div>
            </div>
          </div>
        )}

        {answerType === 'Long Answer' && (
          <div>
            <div className="flex flex-col gap-8 sm:flex-row sm:gap-16 mt-8">
              <div className="flex flex-col gap-3">
                <label className="text-xl text-textBg-700">Points</label>
                <NumberInput
                  className={"w-32"}
                  value={points}
                  onChange={handlePointsChange}
                  defaultValue={1}
                  minValue={1}
                  maxValue={999}
                />
              </div>
            </div>
          </div>
        )}

        {answerType === 'Single Choice' && (
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center flex-row sm:flex-row gap-2">
                <p className="hidden text-xl mr-3 w-6 sm:flex justify-end">{getOptionLabel(index)}</p>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionTextChange(index, e.target.value)}
                  className={`rounded border p-2 flex-grow focus:outline-none 
                    focus:border-textBg-500 w-full ${
                      questionErrors.options &&
                      questionErrors.options[option.id || index]
                        ? 'border-red-500'
                        : ''
                    }`}
                  placeholder="Input text"
                />
                {questionErrors.options &&
                  questionErrors.options[option.id || index] && (
                    <p className="text-red-500 text-sm mt-1">
                      {questionErrors.options[option.id || index]}
                    </p>
                  )}
                <Checkbox
                  checked={option.correct}
                  onChange={() => handleCorrectChange(index)}
                  type="radio"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-textBg-400"
                >
                  <Trash />
                </button>
              </div>
            ))}

            {questionErrors.options &&
              typeof questionErrors.options === 'string' && (
                <p className="text-red-500 text-sm mt-1">
                  {questionErrors.options}
                </p>
              )}

            {questionErrors.correct && (
              <p className="text-red-500 text-sm mt-1">{questionErrors.correct}</p>
            )}

            <div className="flex">
              <div className="sm:w-8 sm:mr-3"></div>
              <Button
                onClick={handleAddOption}
                size="m"
                text="Add new answer"
                icon={<Plus size={16} />}
                className="w-fit mt-3"
                type="secondary"
              />
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <label className="text-xl text-textBg-700">Points</label>
              <NumberInput
                className={"w-32"}
                defaultValue={1}
                minValue={1}
                maxValue={999}
                value={points}
                onChange={handlePointsChange}
              />
            </div>
          </div>
        )}

        {answerType === 'Multiple Choice' && (
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center flex-row sm:flex-row gap-2">
                <p className="hidden text-xl mr-3 w-6 sm:flex justify-end">{getOptionLabel(index)}</p>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionTextChange(index, e.target.value)}
                  className={`rounded border p-2 flex-grow focus:outline-none 
                    focus:border-textBg-500 w-full ${
                      questionErrors.options &&
                      questionErrors.options[option.id || index]
                        ? 'border-red-500'
                        : ''
                    }`}
                  placeholder="Input text"
                />

                <Checkbox
                  checked={option.correct}
                  onChange={() => handleCorrectChange(index)}
                  type="checkbox"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="text-textBg-400"
                >
                  <Trash />
                </button>
              </div>
            ))}

            {questionErrors.options &&
              typeof questionErrors.options === 'string' && (
                <p className="text-red-500 text-sm mt-1">
                  {questionErrors.options}
                </p>
              )}

            {questionErrors.correct && (
              <p className="text-red-500 text-sm mt-1">{questionErrors.correct}</p>
            )}

            <div className="flex">
              <div className="sm:w-8 sm:mr-3"></div>
              <Button
                onClick={handleAddOption}
                size="m"
                text="Add new answer"
                icon={<Plus size={16} />}
                className="w-fit mt-3"
                type="secondary"
              />
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <label className="text-xl text-textBg-700">Points</label>
              <NumberInput
                className={"w-32"}
                defaultValue={1}
                minValue={1}
                maxValue={999}
                value={points}
                onChange={handlePointsChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
