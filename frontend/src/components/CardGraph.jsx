import React from 'react';
import PieChart from './PieChart';

const CardGraph = ({ text, percentage, attended, total, background, foreground, inside }) => {
  return (
    <div className="flex flex-1 items-center justify-between bg-white rounded-lg p-4 border border-textBg-200">
      <div>
        <p className="text-textBg-500 font-bold text-sm">{text}</p>
        <p className="text-3xl font-bold text-textBg-700 mb-2">{percentage}%</p>
        {attended !== undefined && total !== undefined && (
          <p className="text-textBg-500 text-sm">{attended}/{total}</p> 
        )}
      </div>
      <PieChart 
        percentage={percentage} 
        inside={inside}
        background={background} 
        foreground={foreground} 
        size={100} 
        strokeWidth={8}
      />
    </div>
  );
};

export default CardGraph;
