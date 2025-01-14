/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { ScrollText, Clock3, Pen, Calendar, User, Check, Bold } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import Button from '../components/Button';
import ExamTag from '../components/ExamTag';
import TagClassStudent from '../components/TagClassStudent';
import Switch from '../components/Switch';
import NumberInput from "../components/NumberInput";
import { useNavigate } from 'react-router-dom';
import { getToken, getUserRole } from "../utils/UserRoleUtils";
import UserRoles from "../utils/userRoles"
import { Info } from 'lucide-react';
import Tooltip from '../components/Tooltip'
import { toast } from 'react-toastify';

export function ExamDetails() {
  const [examData, setExamData] = useState(null);
  const [attemptsData, setAttemptsData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [statusData, setStatusData] = useState(null);
  const [gradeError, setGradeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = getToken();
  const userRole = getUserRole();

  const queryParams = new URLSearchParams(window.location.search);
  const exam_id = queryParams.get('exam_id');
    
    const getScoreStyles = (score, maxScore) => {
      let percent = ((score / maxScore) * 100).toFixed(2);
  
      if (percent > 75) {
        return {
          background: 'bg-green-100',
          textColor: 'text-green-600',
        };
      } else if (percent > 50) {
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

  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      setError(null);

      try {
        const examRes = await fetch(`http://localhost:3000/exams/${exam_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!examRes.ok) {
          const errData = await examRes.json();
          throw new Error(errData.message || 'Failed to fetch exam info.');
        }

        const examJson = await examRes.json();
        const examInfo = examJson.data; 
        setExamData(examInfo);

        if (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) {
          const statusRes = await fetch(`http://localhost:3000/exams/checkExamState/${exam_id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!statusRes.ok) {
            const errData = await partRes.json();
            throw new Error(errData.message || 'Failed to fetch exam status.');
          }
          const statusJson = await statusRes.json();
          const status = statusJson.message;

          const partRes = await fetch(`http://localhost:3000/exams/${exam_id}/getParticipants`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!partRes.ok) {
            const errData = await partRes.json();
            throw new Error(errData.message || 'Failed to fetch participants.');
          }
          const partJson = await partRes.json();
          const { studentsParticipants,  classesParticipants } = partJson.data;


          const questRes = await fetch(`http://localhost:3000/exams/${exam_id}/getExamQuestions`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!questRes.ok) {
            const qErrData = await questRes.json();
            throw new Error(qErrData.message || 'Failed to fetch questions.');
          }

          const questJson = await questRes.json();
          const examQuestions = questJson.data.questions;

          setParticipants({
            classes: classesParticipants,
            students: studentsParticipants
          });
          setQuestions(examQuestions);
          console.log("9999")
          console.log(status);
          setStatusData(status);
        }
        
        if (userRole === UserRoles.Student) {
          const attemptsRes = await fetch(`http://localhost:3000/exams/getMyAttempts/${exam_id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!attemptsRes.ok) {
            const errData = await attemptsRes.json();
            throw new Error(errData.message || 'Failed to fetch attempts info.');
          }
  
          const attemptsJson = await attemptsRes.json();
          const attemptsInfo = attemptsJson.data; 
          setAttemptsData(attemptsInfo);

        }

      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to load exam details.')
      } finally {
        setLoading(false);
      }
    };

    if (exam_id) {
      fetchExamData();
    } else {
      setLoading(false);
      setError('No exam ID provided.');
    }
  }, [exam_id, userRole, token]);


  const handleDeleteExam = () => {
    const DeleteExam = async () => {
      try {
        const examRes = await fetch(`http://localhost:3000/exams/${exam_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const errData = await examRes.json();

        if (!examRes.ok) {
          throw new Error(errData.message || 'Failed to delete exam.');
        } else {
          navigate('/');
          toast.success(errData.message || 'Exam details loaded successfully.')
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to delete exam.')
      } finally {
        setLoading(false);
      }
    }
    DeleteExam();
  };

  const handleGradeExam = async () => {
    let mode = 'grade';
    if (statusData != 'All students have been graded.' && statusData != 'The exam can be graded.') {
      toast.error(statusData);

    }
    console.log(statusData)
  
    if (statusData === 'All students have been graded.' || statusData === 'The exam can be graded.') {
      if (statusData === 'All students have been graded.'){
        const confirmRegrade = window.confirm('All students have been graded. Do you want to regrade the exam?');
        if (confirmRegrade) {
          mode = 'regrade';
        } else {
          return;
        }
      }

      const requestBody = {
        mode: mode
      };
    
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token missing.');
          return;
        }
    
        const response = await fetch(`http://localhost:3000/exams/gradeExam/${exam_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
    
        const result = await response.json();
    
        if (response.ok) {
          if (mode === 'grade') {
            setStatusData("All students have been graded.");
            toast.success("All students have been graded.");
          } else if (mode === 'regrade') {
            setStatusData("Grades have been successfully regraded.");
            toast.success("Grades have been successfully regraded.");
          }
        } else {
          setError(result.error || 'Failed to grade exam.');
          toast.error(result.message || 'Failed to grade exam.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        toast.error(err.message || 'An unexpected error occurred.');
      }
    }
    
  };

  if (!examData) {
    return <p>No exam data available.</p>;
  }

  const now = new Date();
  const start = new Date(examData.start_date_time);
  const end = new Date(examData.end_date_time);

  const isExamActive = now >= start && now <= end;
  
  const handleViewResults = () => {
    navigate(`/ViewResults?exam_id=${exam_id}`);
  };

  const handleSolveExam = () => {
    navigate(`/SolveExam?exam_id=${exam_id}`);
  };  
  const handleEvaluateAnswers = () => {
    navigate(`/EvaluateExam?exam_id=${exam_id}`);
  };

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleString('pl-PL', options);
  };

  const handleEditBasicInfo = () => {
    navigate(`/update-exam/${exam_id}/basic-information`);
  };
  const handleEditQuestions = () => {
    navigate(`/update-exam/${exam_id}/edit-questions`);
  };

  const handleEditParticipants = () => {
    navigate(`/update-exam/${exam_id}/edit-participants`);
  };
  const handleEditSettings = () => {
    navigate(`/update-exam/${exam_id}/edit-settings`);
  };

  const showEditIcons = (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator);
  const showParticipantsAndQuestions = (userRole === UserRoles.Teacher || userRole === UserRoles.Administrator);


  return(
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      {loading ? (
        <p className="flex items-center justify-center mt-8 font-medium text-xl text-gray-800">Loading exam details...</p>
      ) : !examData ? (
        <p className="text-primary-500">No exam data available.</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageTitle text="About Exam" />
            {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
              <>
              <div className="sm:hidden">
                <Button 
                  size="s"
                  text="Delete exam" 
                  className='mb-4 min-w-0 px-4'
                  type="primary" 
                  onClick={handleDeleteExam}
                />
              </div>
              <div className="flex gap-4">
                <div className="hidden sm:flex">
                  <Button 
                    size="m"
                    text="Grade exam" 
                    className='w-auto mb-4 lg:mb-7'
                    type="secondary" 
                    onClick={handleGradeExam}
                  />
                </div>
                <div className="hidden sm:flex">
                  <Button 
                    size="m"
                    text="Delete exam" 
                    className='w-auto mb-4 lg:mb-7'
                    type="primary" 
                    onClick={handleDeleteExam}
                  />
                </div>
              </div>
              </>
            )}
          </div>

          <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8">
            <div className="flex flex-nowrap flex-row justify-between items-center">
              <p className="text-2xl text-primary-500 font-bold">Basic Information</p>
              {showEditIcons && ( 
                <Button 
                  type="link" 
                  size="s" 
                  icon={<Pen size={16}/>} 
                  onClick={handleEditBasicInfo} 
                  className='min-w-9 max-w-9 w-fit' 
                />
              )}
            </div>

            <label className="text-xl text-textBg-700 mt-2">{examData.gradebook_exam}</label>
            <div className="flex flex-col mt-4 mb-2">
              <p className="text-sm text-textBg-600 mb-1">
                {examData.start_date_time && examData.end_date_time
                  ? `${formatDateTime(examData.start_date_time)} - ${formatDateTime(examData.end_date_time)}`
                  : 'Dates not available'}
              </p>
              <p className="font-semibold text-xl text-textBg-700">{examData.title}</p>
            </div>
            
            <p className="text-base sm:text-lg text-textBg-700 webkit-box webkit-line-clamp-4 webkit-box-orient-vertical overflow-hidden">
              {examData.description || 'No description provided.'}
            </p>

            <div className='flex gap-4 flex-wrap mt-4'> 
              <ExamTag text={`${examData.number_of_questions} questions`} icon={<ScrollText size={16} />} />
              <ExamTag text={`${examData.duration} min`} icon={<Clock3 size={16} />} />
            </div>      
          </div>

          {userRole === UserRoles.Student && !examData.hide_results && (
            <div className='flex flex-col gap-3 mt-6'>
              {attemptsData.map((attempt) => {
                const { background, textColor } = getScoreStyles(attempt.total_score, attempt.max_score);
                const AttemptName = `Attempt nr. ${attempt.attempt_number}.`;
                const scorePercentage = ((attempt.total_score / attempt.max_score) * 100).toFixed(0);
                

                return (
                  <div key={attempt.attempt_id}>
                    <div className='flex items-center justify-between'>
                      <div className="flex items-center justify-between gap-4">
                        <p className='font-medium w-28'>{AttemptName}</p>
                        <Tooltip 
                          content={
                            <div className='w-fit'>
                              <div className='flex gap-2 items-start'>
                                <p className="font-medium text-sm text-textBg-100 text-left w-24">Score</p>
                                <p className={`${textColor} text-sm font-extrabold`}>
                                  {attempt.total_score}/{attempt.max_score}pt ({scorePercentage}%)
                                </p>
                              </div>
                              <div className='flex gap-2 items-start'>
                                <p className="text-sm font-semibold text-textBg-100 text-left w-24">Submit Date</p>
                                <p className="text-sm font-semibold">{new Date(attempt.end_time).toLocaleDateString()} {new Date(attempt.end_time).toLocaleTimeString()}</p>
                              </div>
                              <div className='flex gap-2 items-start'>
                                <p className="text-sm font-semibold text-textBg-100 text-left w-24">Time Spent</p>
                                <p className="text-sm font-semibold">{calculateTimeSpent(attempt.start_time, attempt.end_time)}</p>
                              </div>
                            </div>
                          } 
                          position="right"
                        >
                          <Info 
                            className="w-5 h-5 text-yellow-500 cursor-pointer" 
                            strokeWidth={3} 
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Tooltip>
                      </div>
                      {(userRole === UserRoles.Student && examData.allow_review ) &&(
                        <Button
                        text="Show Details"
                        size="s"
                        type="link"
                        className="max-[380px]:min-w-24 max-[380px]:w-24"
                        onClick={() => handleShowDetails(attempt.attempt_id)}
                      />
                      )}

                    </div>
                  </div>
              )})}
            </div>  
          )}

          {showParticipantsAndQuestions && (
            <div className="flex flex-col border border-solid rounded border-textBg-200 mt-8 p-4 sm:p-8">
            <div className="flex flex-nowrap gap-4 flex-row justify-between items-center">
              <p className="text-2xl text-primary-500 font-bold">Questions</p>
              {showEditIcons && ( 
                <Button 
                  type="link" 
                  size="s" 
                  icon={<Pen size={16}/>} 
                  onClick={handleEditQuestions} 
                  className='min-w-9 max-w-9 w-fit' 
                />
              )}
            </div>
            <div className="mt-4">
              {questions && questions.length > 0 ? questions.map((q, qIndex) => (
                <div key={q.id} className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-lg text-textBg-700 font-bold">Question {qIndex + 1}</p>
                    <p className="bg-primary-500 text-textBg-100 text-sm font-bold px-3 py-1 rounded-full">
                      {q.score} pt
                    </p>
                  </div>
                  <p className="font-normal text-textBg-900 text-lg">
                    {q.description}
                  </p>
                  {q.answers && q.answers.length > 0 && (
                    <div className="mt-2">
                      {q.answers.map((a, index) => {
                        const letter = String.fromCharCode(65 + index);
                        return (
                          <div key={a.id} className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <p className="text-base font-semibold">{letter}.</p>
                              <p className="text-base font-normal">{a.description}</p>
                            </div>
                            {a.is_correct && (
                              <Check size={18} color="#1dd75b" strokeWidth={3}/>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )) : 
                <p>No questions available.</p>
              }
            </div>
          </div>
          )}

          {showParticipantsAndQuestions && (
            <div className="flex flex-col border border-solid rounded border-textBg-200 mt-8 p-4 sm:p-8">
              <div className="flex flex-nowrap gap-4 flex-row justify-between items-center">
                <p className="text-2xl text-primary-500 font-bold">Access To Test</p>
                {showEditIcons && ( 
                  <Button 
                    type="link" 
                    size="s" 
                    icon={<Pen size={16}/>} 
                    onClick={handleEditParticipants} 
                    className='min-w-9 max-w-9 w-fit' 
                  />
                )}
              </div>
              
              <div className="mt-4">
                <p className="font-bold text-textBg-700 text-lg">Classes added</p>
                <div className="mt-4 flex flex-wrap gap-6">
                  {participants && participants.classes && participants.classes.length > 0 ? participants.classes.map(cls => (
                    <TagClassStudent key={cls.id} text={cls.name} />
                  )) : 
                    <p>No classes added.</p>
                  }
                </div>
              </div>
              
              <div className="mt-6">
                <p className="font-bold text-textBg-700 text-lg">Students added</p>
                <div className="mt-4 flex flex-wrap gap-6">
                  {participants && participants.students && participants.students.length > 0 ? participants.students.map(st => (
                    <TagClassStudent key={st.id} text={`${st.first_name} ${st.last_name}`} />
                  )) : 
                    <p>No students added.</p>
                  }
                </div>
              </div>
            </div>
          )}

          
          {showParticipantsAndQuestions && (
            <div className="flex flex-col border border-solid rounded border-textBg-200 mt-8 p-4 sm:p-8">
              <div className="flex flex-nowrap gap-4 flex-row justify-between items-center">
                <p className="text-2xl text-primary-500 font-bold">Settings</p>
                {showEditIcons && ( 
                  <Button 
                    type="link" 
                    size="s" 
                    icon={<Pen size={16}/>} 
                    onClick={handleEditSettings} 
                    className='min-w-9 max-w-9 w-fit' 
                  />
                )}
              </div>
              
              <div className="mt-4 grid gap-3 grid-cols-1 xl:grid-cols-2">            
                <Switch text="Randomly change the order of the questions" isOn={examData.randomise_questions} disabled />
                <Switch text="Randomly change the order of answers" isOn={examData.randomise_answers} disabled  />
                <Switch text="Block the ability to copy and paste text" isOn={examData.block_copying_pasting} disabled />
                <Switch text="Set a Time Limit for Each Question" isOn={examData.time_limit_for_each_question } disabled />
                <Switch text="End test when the user leaves the window" isOn={examData.end_test_after_leaving_window} disabled/>

                <Switch text="Hides the test results when the test is finished" isOn={examData.hide_results} disabled  />
                <Switch text="Displays the number of points for each question" isOn={examData.display_points_per_question} disabled  />
                <Switch text="Show the correct answers when reviewing" isOn={examData.show_correct_answers} disabled />
                
                <Switch text="Allow the user to return to previous questions" isOn={examData.allow_navigation} disabled  />
                <Switch text="Allow the user to review the test after completion" isOn={examData.allow_navigation} disabled   />
                <Switch text="Latest attempt counts" isOn={examData.latest_attempt_counts} disabled />
                <Switch text="Best attempt counts" isOn={examData.best_attempt_counts} disabled />
                <Switch text="Allow the user to attempt the test multiple times" isOn={examData.multiple_tries} disabled  />
                <NumberInput className={"w-32 mt-4"} value={examData.number_of_tries} disabled min={1} defaultValue={1} />
              </div>
            </div>
          )}

          <div className="flex mt-8 gap-4 sm:gap-8 justify-end">
            {(userRole === UserRoles.Student && isExamActive) && (
              <Button 
                size="m" 
                text="Solve Exam" 
                type="primary" 
                className="w-full" 
                onClick={handleSolveExam} 
              />
            )} 
            
            {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) &&(
              <div className="flex gap-4">
                <Button 
                  size="l" 
                  text="Check Results" 
                  type="secondary" 
                  className={"max-[380px]:min-w-24 max-[380px]:w-24"} 
                  onClick={handleViewResults} 
                />
                <Button 
                  size="l" 
                  text="Evaluate Answers" 
                  type="primary" 
                  className={"max-[380px]:min-w-24 max-[380px]:w-24"} 
                  onClick={handleEvaluateAnswers} 
                />
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
