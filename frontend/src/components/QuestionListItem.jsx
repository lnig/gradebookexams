import React from 'react';

const QuestionListItem = ({ number, answered, correct, onClick }) => {
    let bgColor = 'border-textBg-500 text-textBg-500';
    if (answered) {
        bgColor = 'border-success-700 text-success-700';
    }
    if (correct === true) {
        bgColor = 'border-success-500 text-success-500';
    } else if (correct === false) {
        bgColor = 'border-primary-500 text-primary-500';
    } else if (correct === 'half') {
        bgColor = 'border-info-500 text-info-500';
    }

    return (
        <div 
            className={`w-10 h-10 flex items-center border justify-center rounded ${bgColor} cursor-pointer`}
            onClick={onClick}
        >
            <p className="font-bold">{number}</p>
        </div>
    );
};

export default QuestionListItem;