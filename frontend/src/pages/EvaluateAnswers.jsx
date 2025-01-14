import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import PageTitle from "../components/PageTitle";
import QuestionOnSolving from "../components/QuestionOnSolving";
import NumberInput from "../components/NumberInput";
import Button from "../components/Button";
import { toast } from 'react-toastify';
import { API_EXAMS_URL } from "../utils/config";

export function EvaluateAnswers() {
    const [data, setData] = useState(null);
    const [scores, setScores] = useState({});
    const [errors, setErrors] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();

    const useQuery = () => {
        return new URLSearchParams(location.search);
    };

    const query = useQuery();
    const attempt_id = query.get('attempt_id');
    const exam_id = query.get('exam_id');

    useEffect(() => {
        const fetchData = async () => {
            if (!attempt_id && !exam_id) {
                setError('No attempt ID or exam ID provided.');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No authorization token. Please log in again.');
                    setLoading(false);
                    return;
                }

                let response;
                let result;

                if (exam_id) {
                    response = await fetch(`${API_EXAMS_URL}/exams/showAllOpenAnswersToGrade/${exam_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                } else {
                    response = await fetch(`${API_EXAMS_URL}/exams/showOpenAnswersToGrade/${attempt_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                }

                result = await response.json();
                console.log(result)

                if (response.ok) {
                    setData(result.data);
                    if (exam_id) {
                        const initialScores = {};
                        result.data.open_questions_to_grade.forEach(participant => {
                            participant.questions.forEach(q => {
                                initialScores[q.student_open_answer_id] = q.student_score !== null ? q.student_score : 0;
                            });
                        });
                        setScores(initialScores);
                    } else {
                        const initialScores = {};
                        result.data.open_questions_to_grade.forEach(q => {
                            initialScores[q.student_open_answer_id] = q.student_score !== null ? q.student_score : 0;
                        });
                        setScores(initialScores);
                    }
                } else {
                    setError(result.message || 'Failed to fetch open answers to grade.');
                }
                
            } catch (err) {
                setError('An unexpected error occurred.');
                toast.error(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [attempt_id, exam_id]);

    const handleScoreChange = (id, value, max_score) => {
        setScores(prevScores => ({
            ...prevScores,
            [id]: value,
        }));

        if (Number(value) > max_score) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [id]: `The entered score exceeds the maximum allowed score of ${max_score}.`,
            }));
        } else {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstErrorQuestionId = Object.keys(errors)[0];
            const element = document.getElementById(firstErrorQuestionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus({ preventScroll: true });
            }
        }
    }, [errors]);

    const handleSubmit = async () => {
        if (Object.keys(errors).length > 0) {
            setError('Please fix the errors before submitting.');
            return;
        }

        let payload;

        payload = Object.keys(scores).map(id => ({
            student_open_answer_id: id,
            score: Number(scores[id]),
        }));

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authorization token. Please log in again.');
                return;
            }

            const response = await fetch(`${API_EXAMS_URL}/exams/gradeOpenAnswers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                navigate(`/EvaluateExam?exam_id=${data.exam_id}`);
                toast.success("Answers evaluated successfully.")
            } else {
                throw new Error(result.message || 'Failed to grade answers.');
            }
        } catch (err) {
            toast.error(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="text-gray-500">Loading open answers to grade...</p>;
    }

    if (error && Object.keys(errors).length === 0) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!data) {
        return <p className="text-textBg-500">No data available.</p>;
    }

    return (
        <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8 grid">
            <PageTitle text="Evaluate Answers" />

            <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8 gap-8">
                {exam_id ? (
                    <>
                        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
                            <p className="text-textBg-700 text-2xl lg:text-3xl">{data.exam_name}</p>
                        </div>
                        {data.open_questions_to_grade.map((participant, index) => (
                            <div key={index} className="border p-4 rounded">
                                <div className="flex items-center gap-2">
                                    <p className="text-textBg-700">{participant.firstName} {participant.lastName}</p>
                                </div>

                                {participant.questions.map((question, qIndex) => (
                                    console.log("s" + question.max_score),
                                    <div 
                                        key={question.student_open_answer_id} 
                                        className="flex flex-col mt-4"
                                        id={question.student_open_answer_id} 
                                        tabIndex="-1"
                                    >
                                        <QuestionOnSolving 
                                            number={`Question ${index + 1}`}
                                            type="Long" 
                                            value={question.student_description} 
                                            attemptNumber={question.attempt_number}
                                            disabled 
                                            description={question.question_description}
                                            score={question.max_score}
                                        />
                                        <div className="flex flex-col gap-3">
                                            <label className="text-xl text-textBg-700">Points</label>
                                            <NumberInput 
                                                className="w-32" 
                                                value={scores[question.student_open_answer_id]} 
                                                onChange={(value) => handleScoreChange(question.student_open_answer_id, value, question.max_score)}
                                                maxValue={question.max_score}
                                            />      
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
                            <p className="text-textBg-700 text-2xl lg:text-3xl">{data.exam_title}</p>
                            <p className="text-textBg-700">{data.first_name} {data.last_name}</p>
                        </div>
                       
                        {data.open_questions_to_grade.map((question, index) => (
                            <div 
                                key={question.student_open_answer_id} 
                                className="flex flex-col gap-4"
                                id={question.student_open_answer_id} 
                                tabIndex="-1"
                            >
                                <QuestionOnSolving 
                                    number={index + 1} 
                                    type="Long" 
                                    value={question.student_description} 
                                    disabled 
                                    solving={true}
                                    description={question.question_description}
                                />
                                <div className="flex flex-col gap-3">
                                    <label className="text-xl text-textBg-700">Points</label>
                                    <NumberInput 
                                        className="w-32" 
                                        value={scores[question.student_open_answer_id]} 
                                        onChange={(value) => handleScoreChange(question.student_open_answer_id, value, question.max_score)}
                                        maxValue={question.max_score}
                                    />      
                                </div>
                            </div>
                        ))}

                    </>
                )}
                <div>
                    <Button 
                        text="Submit Grades" 
                        size="m" 
                        className="w-full bg-primary-500 text-white" 
                        onClick={handleSubmit}
                        disabled={loading}
                    />
                </div>
            </div>
             
        </main>
    );

}

export default EvaluateAnswers;
