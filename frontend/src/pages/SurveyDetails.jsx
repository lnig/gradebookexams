import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getToken } from '../utils/UserRoleUtils';
import PageTitle from '../components/PageTitle';
import { Calendar } from 'lucide-react';
import { API_GRADEBOOK_URL } from '../utils/config';

function SurveyDetails() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const token = getToken();

  useEffect(() => {
    const fetchSurveyDetails = async () => {
      try {
        const response = await fetch(`${API_GRADEBOOK_URL}/survey/details/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Survey details fetched:', result);
        setSurvey(result.data);
      } catch (err) {
        toast.error(err.message || 'Error fetching survey details.');
      }
    };

    fetchSurveyDetails();
  }, [id, token]);

  if (!survey) {
    return <p>Loading survey data...</p>;
  }

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Survey Details" />
      <div className="flex flex-col justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <p className='text-textBg-800 font-semibold text-xl'>{survey.name}</p>
          <div className="flex items-center text-textBg-500">
            <Calendar size={16} className="mr-2" />
            <span className="font-medium text-sm">
              {new Date(survey.start_time).toLocaleString()} - {new Date(survey.end_time).toLocaleString()}
            </span>
          </div>
        </div>
        <p className="text-text-bg-700 mb-2">{survey.description}</p>

        <h2 className="text-xl font-semibold mt-4">Questions</h2>
        {survey.questions && survey.questions.length > 0 ? (
          <ul className="flex mt-2">
            {survey.questions.map((q) => (
              <li key={q.id} className="mb-4">
                <p className="font-medium text-textBg-900">{q.content}</p>
                {q.questions_possible_responses && q.questions_possible_responses.length > 0 && (
                  <div className="mt-1">
                    <p className="text-sm font-semibold"></p>
                    <ul className="list-decimal list-inside">
                      {q.questions_possible_responses.map((possResp) => (
                        <li key={possResp.id} className="text-sm">
                          {possResp.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {q.questions_responses && q.questions_responses.length > 0 ? (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Student Answer</p>
                    <ul className="list-decimal list-inside">
                      {q.questions_responses.map((resp) => (
                        <li key={resp.id} className="text-sm">
                          {resp.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="ml-4 text-gray-500 text-sm mt-2">No responses for this question.</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No questions in this survey.</p>
        )}
      </div>
    </main>
  );
}

export default SurveyDetails;
