import React, { useState } from 'react';
import Button from "../../Button";
import { Plus, Trash, X } from 'lucide-react';
import Modal from '../../Modal';
import { toast } from 'react-toastify';
import { getToken } from '../../../utils/UserRoleUtils';

function CreateSurveyForm({ onSuccess, onClose, isOpen, questionTypes = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    questions: [
      {
        content: '',
        questionTypeId: '',
        responses: [],
      },
    ],
  });

  const token = getToken();
  const [loading, setLoading] = useState(false);

  const handleSurveyChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          content: '',
          questionTypeId: '',
          responses: [],
        },
      ],
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    if (field === 'questionTypeId') {
      updatedQuestions[index][field] = value;
      const selectedQuestionType = questionTypes.find(qt => qt.id === value);
      if (selectedQuestionType && selectedQuestionType.name.toLowerCase() === 'open') {
        updatedQuestions[index].responses = [];
      }
    } else {
      updatedQuestions[index][field] = value;
    }
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addResponse = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    const responses = updatedQuestions[questionIndex].responses || [];
    updatedQuestions[questionIndex].responses = [...responses, { content: '' }];
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleResponseChange = (questionIndex, responseIndex, value) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[questionIndex].responses) {
      updatedQuestions[questionIndex].responses[responseIndex].content = value;
    }
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeResponse = (questionIndex, responseIndex) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[questionIndex].responses) {
      updatedQuestions[questionIndex].responses = updatedQuestions[questionIndex].responses.filter(
        (_, i) => i !== responseIndex
      );
    }
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const [startDatePart, startTimePart] = formData.start_time.split('T');
      const [endDatePart, endTimePart] = formData.end_time.split('T');

      const payload = {
        name: formData.name,
        description: formData.description,
        startDate: startDatePart,
        endDate: endDatePart,
        startTime: startTimePart,
        endTime: endTimePart,
        questions: formData.questions
      };

      const response = await fetch('http://localhost:3001/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const responseData = await response.json();
      toast.success("Survey created successfully");
      onSuccess(responseData);
      onClose();
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error("An error occurred while creating the survey");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({});
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create Survey</h2>
        <X size={24} className="hover:cursor-pointer" onClick={handleCancel} />
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="name">Survey Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleSurveyChange}
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="description">Survey Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleSurveyChange}
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            required
          />
        </div>
        <div className='flex gap-6'>
          <div className="flex flex-col gap-2 w-1/2">
            <label className="text-base text-textBg-700" htmlFor="start_time">Start Date</label>
            <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleSurveyChange}
                className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
                required
            />
          </div>
          <div className="flex flex-col gap-2 w-1/2">
            <label className="text-base text-textBg-700" htmlFor="end_time">End Date</label>
            <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={handleSurveyChange}
                className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
                required
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className='flex justify-between items-center'>
            <h3 className="text-lg font-bold text-textBg-900">Questions</h3>
            <Button 
              type="secondary"
              icon={<Plus size={16}/>} 
              onClick={addQuestion} 
              size="s"
              className="min-w-8 w-8 h-8"
              btnType="button"
            />
          </div>
          
          {formData.questions.map((question, qIndex) => {
            const selectedQuestionType = questionTypes.find(
              (qt) => qt.id === question.questionTypeId
            );
            const isClosed =
              selectedQuestionType &&
              selectedQuestionType.name.toLowerCase() === 'closed';

            return (
              <div key={qIndex} className="flex flex-col gap-6 border p-4 rounded">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Question {qIndex + 1}</h4>
                  <Button 
                    type="link" 
                    icon={<Trash size={20}/>} 
                    onClick={() => removeQuestion(qIndex)}       
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base text-textBg-700" htmlFor={`question-content-${qIndex}`}>Question Content</label>
                  <input
                    id={`question-content-${qIndex}`}
                    type="text"
                    value={question.content}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, 'content', e.target.value)
                    }
                    className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base text-textBg-700" htmlFor={`question-type-${qIndex}`}>Question Type</label>
                  <select
                    id={`question-type-${qIndex}`}
                    value={question.questionTypeId}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, 'questionTypeId', e.target.value)
                    }
                    className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
                    required
                  >
                    <option value="" hidden disabled>Select Type</option>
                    {questionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isClosed && (
                  <div className="flex flex-col gap-4">
                    {(question.responses || []).map((response, rIndex) => (
                      <div key={rIndex} className="flex items-center gap-1">
                        <p className='text-lg w-8'>{rIndex+1}</p>
                        <input
                          type="text"
                          value={response.content}
                          onChange={(e) =>
                            handleResponseChange(qIndex, rIndex, e.target.value)
                          }
                          className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
                          required
                        />
                         <Button 
                          type="link" 
                          icon={<Trash size={20}/>} 
                          onClick={() => removeResponse(qIndex, rIndex)}     
                        />
                      </div>
                    ))}
                    <Button
                      text="Add Response"
                      type="tertiary"
                      onClick={() => addResponse(qIndex)}
                      className="mt-2"
                      btnType="button"
                   />
                  </div>
                )}
              </div>
            );
          })}
          
        </div>

       <div className="flex justify-end gap-4">
          <Button
              text="Cancel"
              type="secondary"
              onClick={handleCancel}
              disabled={loading}
              className="!min-w-0 !w-24 tn:!min-w-36"
          />
          <Button
              text={loading ? "Creating..." : "Create"}
              disabled={loading}
              className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateSurveyForm;
