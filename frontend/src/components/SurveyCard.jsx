import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // <-- import Link
import Button from './Button';
import Modal from './Modal';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { getToken, getUserId, getUserRole } from '../utils/UserRoleUtils';
import { toast } from 'react-toastify';
import UserRoles from '../utils/userRoles';

function SurveyCard({ 
  id, 
  name, 
  description, 
  startTime, 
  endTime, 
  questions 
}) {
  const [showQuestions, setShowQuestions] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responses, setResponses] = useState({});

  const formattedStartTime = new Date(startTime).toLocaleDateString();
  const formattedEndTime = new Date(endTime).toLocaleDateString();
  const userRole = getUserRole();

  const openResponseModal = () => {
    setIsResponseModalOpen(true);
  };

  const closeResponseModal = () => {
    setIsResponseModalOpen(false);
    setResponses({});
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitSurvey = async (e) => {
    e.preventDefault();
    const token = getToken();
    const studentId = getUserId();

    const surveyData = {
      studentId,
      surveyId: id,
      responses: Object.entries(responses).map(([questionId, content]) => ({
        questionId,
        content,
      })),
    };

    try {
      const response = await fetch('http://localhost:3001/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      toast.success(result.message || 'Survey submitted successfully.');
      closeResponseModal();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred while submitting the survey.');
    }
  };

  return (
    <div className="p-4 border border-textBg-200 rounded-md bg-white">
      <div className="flex flex-col">
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center w-full">        
          <h3 className="text-xl font-bold text-gray-800">
            {userRole === UserRoles.Administrator ? (
              <Link to={`/surveys/${id}`} className='text-textBg-700'>
               {name}
              </Link>
            ) : (
              <p className='text-textBg-700'>{name}</p>
            )}
          </h3>

          <div className="flex items-center text-textBg-500">
            <Calendar size={16} className="mr-2" />
            <span className="font-medium text-sm">
              {formattedStartTime} - {formattedEndTime}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-base text-textBg-600 mt-2">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4  sm:flex-row sm:justify-between sm:items-center ">
        {questions && questions.length > 0 && (
          <button 
            className="flex items-center text-sm text-primary-500 focus:outline-none"
            onClick={() => setShowQuestions(prev => !prev)}
          >
            {showQuestions ? 'Hide questions' : 'Show questions'}
            {showQuestions ? <ChevronUp size={18} className="ml-1" /> : <ChevronDown size={18} className="ml-1" />}
          </button>
        )}

        <Button 
          text="Fill Survey"
          type="primary"
          size="s"
          onClick={openResponseModal}
        />
      </div>

      {showQuestions && questions && questions.length > 0 && (
        <div className="mt-4 border-t pt-4">
          {questions.map((question) => (
            <div key={question.id} className="mb-4">
              <p className="font-semibold text-textBg-800">{question.content}</p>
              {question.questions_possible_responses && question.questions_possible_responses.length > 0 ? (
                <ul className="mt-2 ml-4 list-disc text-textBg-600">
                  {question.questions_possible_responses.map((response) => (
                    <li key={response.id}>{response.content}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-textBg-600">No predefined responses.</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isResponseModalOpen} onClose={closeResponseModal} widthHeightClassname="max-w-lg max-h-full">
        <h2 className="text-xl font-bold mb-4 text-textBg-700">Fill out survey</h2>
        <form onSubmit={handleSubmitSurvey}>
          {questions && questions.map((question) => (
            <div key={question.id} className="mb-4">
              <label className="text-lg text-textBg-800 font-medium mb-3">
                {question.content}
              </label>
              {question.questions_possible_responses && question.questions_possible_responses.length > 0 ? (
                <div className="flex flex-col mt-3">
                  {question.questions_possible_responses.map((resp) => (
                    <label key={resp.id} className="inline-flex items-center mt-1">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={resp.content}
                        className="form-radio h-3 w-3"
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        required
                      />
                      <span className="ml-2 text-base">{resp.content}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input 
                  type="text"
                  className="w-full border border-textBg-200 rounded px-3 py-2 focus:outline-none"
                  placeholder="Enter your response..."
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  required
                />
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-3">
            <Button 
              text="Cancel" 
              type="secondary" 
              onClick={closeResponseModal}
              className="!min-w-0 !w-24 tn:!min-w-36"
            />
            <Button 
              text="Submit" 
              className="!min-w-0 !w-24 tn:!min-w-36"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SurveyCard;
