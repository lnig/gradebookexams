/* StatisticsBarChart.jsx */
import React, { useState, useEffect } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const calculateTicks = (data) => {
  if (data.length === 0) return [0, 10, 20, 30, 40];
  const maxValue = Math.max(...data.map(d => d.students));
  const step = Math.ceil(maxValue / 4);
  const ticks = Array.from({ length: 10 }, (_, i) => i * step);
  return ticks;
};

const StatisticsBarChart = ({ statistics }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    if (statistics && statistics.scoreDistribution) {
      const data = statistics.scoreDistribution.map(item => ({
        name: item.range,
        students: item.count
      }));
      setProcessedData(data);
    }
  }, [statistics]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    handleResize(); 
    window.addEventListener('resize', handleResize); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ticks = calculateTicks(processedData);
  const maxDomain = Math.max(...ticks, 10);

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
      <RechartsBarChart
        data={processedData}
        layout="horizontal"
        margin={{ top: 0, right: isMobile ? 10 : 50, left: 0, bottom: isMobile ? 16 : 0 }}
        barCategoryGap={isMobile ? 60 : 30}
      >
        <CartesianGrid vertical={false} horizontal={false} stroke="#dee1e6" />
        <XAxis 
          dataKey="name"
          type="category" 
          axisLine={false} 
          tickLine={false} 
          interval={0} 
          tick={{ 
            fontSize: 12, 
            fill: '#323743', 
            dy: 8, 
            display: isMobile ? 'none' : 'block' 
          }}
        />
        <YAxis
          dataKey="students"
          type="number"
          axisLine={false}
          tickLine={false}
          ticks={ticks}
          domain={[0, maxDomain]}
          tick={{ fontSize: 14, fill: '#323743', dx: -10 }}
          allowDecimals={false}
        />
        <Tooltip formatter={(value) => `${value} students`} />
        <Bar 
          dataKey="students" 
          fill="#3799e5"
          barSize={48}
          radius={[4,4,4,4]}
        >
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default StatisticsBarChart;
