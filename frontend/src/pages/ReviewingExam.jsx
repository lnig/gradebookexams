import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import PageTitle from "../components/PageTitle";
import QuestionOnSolving from "../components/QuestionOnSolving";
import { toast } from 'react-toastify';
import { API_EXAMS_URL } from "../utils/config";

export function ReviewingExam() {
    const { attempt_id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAttemptDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_EXAMS_URL}/exams/getAttemptDetails/${attempt_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to fetch attempt details.');
                }

                const responseData = await response.json();
                setData(responseData.data);
            } catch (err) {
                setError(err.message);
                toast.error(err.message || "An unexpected error occurred.")
            } finally {
                setLoading(false);
            }
        };

        if (attempt_id) {
            fetchAttemptDetails();
        } else {
            setLoading(false);
            setError('No attempt ID provided.');
        }
    }, [attempt_id]);

    return (
        <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8 grid">
            
            {loading ? (
                <p className="text-gray-500">Loading results...</p>
            ) : (
                <>
                <div className="flex flex-col md:flex-row md:justify-between w-full">
                    <PageTitle text={`Exam: ${data.exam_title || 'Exam Details'}`} />
                </div>

                <div className="flex w-full gap-8 lg:gap-16">
                    <div className="flex-1">
                        <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8 gap-8">
                            {data.questions.length > 0 ? (
                                data.questions.map((question, index) => (
                                    <QuestionOnSolving
                                        key={question.id || index}
                                        number={`Question ${index + 1}`}
                                        type={question.type === "CLOSED" ? "Multiple" : "Long"}
                                        answers={question.answers || []}
                                        score={question.max_score}
                                        achieved_score={question.score}
                                        description={question.description}
                                        solving={true}
                                        reviewing={true}
                                        disabled={true}
                                        value={
                                            question.type === 'CLOSED'
                                                ? question.answers
                                                    .filter(answer => answer.selected === true)
                                                    .map(answer => String(answer.id))
                                                : question.student_answer
                                        }
                                    />
                                ))
                            ) : (
                                <p>No questions available.</p>
                            )}
                        </div>
                    </div>
                </div>
                </>
            )}
        </main>
    );
}

export default ReviewingExam;
