/* QuestionChart.jsx */
import React from 'react';
import BarChart2 from "../components/BarChart2"; 
import OpenQuestionChart from "../components/BarChart3";

const QuestionChart = ({ questionNumber, questionTitle, data, type }) => { 
    return (
        <div className="flex flex-col sm:border border-solid rounded border-textBg-200 sm:p-8 w-full mb-8">
            <p className="text-textBg-700 text-2xl font-bold mb-3">Question {questionNumber}</p>
            <p className="text-textBg-700 text-xl mb-8">{questionTitle}</p>
            {type === 'closed' ? (
                <BarChart2 data={data} /> 
            ) : type === 'open' ? (
                <OpenQuestionChart data={data} />
            ) : null}
        </div> 
    ); 
}

export default QuestionChart;
