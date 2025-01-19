import React from 'react';

const PieChart = ({ percentage, inside, background, foreground, size = 100, strokeWidth = 8 }) => {
  const radius = 15.91549431; 
  const circumference = 2 * Math.PI * radius; 
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`; 

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 42 42" className="w-full h-full">
        <circle
          style={{ stroke: background }}
          cx="21"
          cy="21"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
        />
        <circle
          style={{ stroke: foreground }}
          cx="21"
          cy="21"
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset="0"
          transform="rotate(-90 21 21)"
          strokeLinecap="round"
        />
        {inside &&(
          <text
            x="21"
            y="21"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="5"
            fill={foreground}
            fontWeight="bold"
          >
            {percentage}%
          </text>
        )}  
      </svg>
    </div>
  );
};

export default PieChart;
