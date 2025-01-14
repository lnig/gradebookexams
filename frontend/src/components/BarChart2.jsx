/* BarChart2.jsx */
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
  Cell
} from 'recharts';

const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const BarChart2 = ({ data }) => {
  const [sizeLabel, setSizeLabel] = useState();
  const [sizeFont, setSizeFont] = useState();
  const [lengthText, setLengthText] = useState();
  const [isMobile, setIsMobile] = useState(false);

  const totalResponses = data.reduce((sum, item) => sum + item.response_count, 0);

  const processedData = data.map(item => ({
    name: item.description,
    percentage: totalResponses > 0 ? (item.response_count / totalResponses) * 100 : 0,
    is_correct: item.is_correct
  }));

  if (processedData.length === 0) {
    return <p className="text-gray-500">No data available for this question.</p>;
  }

  const maxValue = Math.max(...processedData.map(d => d.percentage));

  const handleResize = () => {
    const windowWidth = window.innerWidth;

    if (windowWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }

    if (windowWidth < 768) {
      setSizeLabel(35);
      setSizeFont(14);
      setLengthText(15);
    } else if (windowWidth < 1024) {
      setSizeLabel(300);
      setSizeFont(16);
      setLengthText(25);
    } else if (windowWidth >= 1024 && windowWidth <= 1280) {
      setSizeLabel(35);
      setSizeFont(18);
      setLengthText(15);
    } else if (windowWidth > 1280 && windowWidth <= 1536) {
      setSizeLabel(300);
      setSizeFont(16);
      setLengthText(25);
    } else if (windowWidth > 1536) {
      setSizeLabel(400);
      setSizeFont(20);
      setLengthText(25);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getColor = (is_correct) => {
    return is_correct ? '#1bd659' : '#EB4C60';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart
        data={processedData}
        layout="vertical"
        margin={{ top: 20, right: 50, left: 0, bottom: 20 }}
        barCategoryGap={20}
      >
        <CartesianGrid vertical={false} horizontal={false} stroke="#dee1e6" />
        <XAxis 
          type="number" 
          domain={[0, Math.ceil(maxValue / 10) * 10]}
          hide 
        />
        <YAxis
          type="category"
          dataKey="name"
          width={sizeLabel}
          tick={{ fontSize: sizeFont, fill: '#171a1f', textAnchor: 'right' }}
          tickLine={false}
          tickMargin={sizeLabel - 10}
          tickFormatter={(text) => truncateText(text, lengthText)}
        />
        <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
        <Bar dataKey="percentage" barSize={48} radius={[4,4,4,4]}>
          <LabelList 
            dataKey="percentage" 
            visibility={isMobile ? 'hidden' : 'visible'} 
            position="right" 
            offset={10} 
            formatter={(value) => `${value.toFixed(2)}%`} 
          />
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.is_correct)} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart2;
