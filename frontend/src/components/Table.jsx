/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResponsiveTable = ({ students, student, result }) => {
  const navigate = useNavigate();
  
  const getScoreStyles = (score, maxScore) => {
    let percent = ((score / maxScore) * 100).toFixed(2);

    if (percent > 75) {
      return {
        background: 'bg-green-100',
        textColor: 'text-green-600',
      };
    } else if (percent > 40) {
      return {
        background: 'bg-yellow-100',
        textColor: 'text-yellow-600',
      };
    } else {
      return {
        background: 'bg-red-100',
        textColor: 'text-red-600',
      };
    }
  };

  const calculateTimeSpent = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);
    return `${diffMinutes}:${diffSeconds < 10 ? '0' : ''}${diffSeconds} min`;
  };

  const handleShowDetails = (attemptId) => {
    navigate(`/view-attempt/${attemptId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className='w-full'>
            <tr>
              { student != undefined && (
                <th className="pr-6 text-base border-gray-300 text-left leading-4 text-textBg-700 py-2">Attempt</th>
              )}
              { result != undefined && (
              <th className="pr-6 text-base border-gray-300 text-left leading-4 text-textBg-700 py-2">Student Name</th>
              )}
              <th className="px-6 text-base border-gray-300 text-center leading-4 text-textBg-700 py-2">Score</th>
              <th className="px-6 text-base border-gray-300 text-center leading-4 text-textBg-700 py-2">Submitted Date</th>
              <th className="px-6 text-base border-gray-300 text-center leading-4 text-textBg-700 py-2">Time Spent</th>
              <th className="px-6 text-base border-gray-300 text-center leading-4 text-textBg-700 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const { background, textColor } = getScoreStyles(student.total_score, student.max_score);
              const fullName = `${student.first_name} ${student.last_name}`;
              const AttemptName = `Attempt nr. ${student.attempt_number}`;
              const scorePercentage = ((student.total_score / student.max_score) * 100).toFixed(2);

              return (
                <tr key={student.attempt_id}>
                  <td className="pr-6 py-3 whitespace-no-wrap flex items-center">
                    { result && (
                      <span className="ml-2">{fullName}</span>
                    )}
                    { student && (
                      <span className="ml-2">{AttemptName}</span>


                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-no-wrap text-center">
                    <div className="flex items-center justify-center">
                      <p className={`px-6 py-1 rounded-full ${background} ${textColor}`}>
                        {student.total_score}/{student.max_score}pt ({scorePercentage}%)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-no-wrap text-center">
                    {new Date(student.end_time).toLocaleDateString()} {new Date(student.end_time).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3 whitespace-no-wrap text-center">
                    {calculateTimeSpent(student.start_time, student.end_time)}
                  </td>
                  <td className="px-6 py-3 whitespace-no-wrap text-center">
                    <button className="bg-primary-500 text-white px-4 py-2 rounded" onClick={() => handleShowDetails(student.attempt_id)} >Show Details</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveTable;
