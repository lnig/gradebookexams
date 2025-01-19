import React from 'react';
import Button from './Button';
import { Pen } from 'lucide-react';

const EvaluateItem = ({ firstName, lastName, endTime, totalScore, maxScore, attemptId, examId, attemptNumber, all }) => {
    const formattedDate = new Date(endTime).toLocaleDateString();
    const formattedTime = new Date(endTime).toLocaleTimeString();

    return (
        <div className="w-fit flex-col flex gap-3 mb-5 text-lg border p-4 rounded">
            <p className="text-textBg-600 text-sm -mb-1">Attempt nr. {attemptNumber}</p>
            <div className="flex items-center lg:min-w-48 gap-2">
                <p className="text-textBg-700 font-semibold">{firstName} {lastName}</p>
            </div>
            
            {all != true ? (
            <>
                <div className="lg:min-w-48 flex gap-2 text-sm text-textBg-500">
                    <p>{formattedDate}</p>
                    <p>{formattedTime}</p>
                </div>
                <div className="lg:min-w-64 flex justify-between items-center">
                    <div className="text-sm rounded-full w-fit">
                        <p className="py-1 font-semibold">{totalScore}/{maxScore} pt</p>
                    </div>
                    <Button
                        size="m"
                        className="min-w-9 w-9 h-9"
                        onClick={() => handleEvaluate(attemptId)} 
                        type="secondary"
                        icon={<Pen size={18} className="text-primary-500" />}
                    />
                </div>
            </>              
            ) : (
            <div>
            <Button
                text="Evaluate all"
                size="m"
                className="w-full"
                onClick={() => handleEvaluateAll(examId)} 
            />    
            </div>
        )}
        </div>
    );
};
const handleEvaluateAll = (examId) => {
    window.location.href = `/EvaluateAnswers?exam_id=${examId}`;
};

const handleEvaluate = (attemptId) => {
    window.location.href = `/EvaluateAnswers?attempt_id=${attemptId}`;
};

export default EvaluateItem;