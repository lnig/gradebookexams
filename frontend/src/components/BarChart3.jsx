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

const OpenQuestionChart = ({ data }) => {
  const processedData = [
    {
      name: 'Correct',
      percentage: data.correct_count + (data.partial_correct_count || 0) + (data.incorrect_count || data.wrong_count || 0) > 0
        ? (data.correct_count / (data.correct_count + (data.partial_correct_count || 0) + (data.incorrect_count || data.wrong_count || 0))) * 100
        : 0,
      type: 'correct'
    },
    ...(data.partial_correct_count
      ? [
          {
            name: 'Partially Correct',
            percentage: (data.partial_correct_count / (data.correct_count + data.partial_correct_count + (data.incorrect_count || data.wrong_count || 0))) * 100,
            type: 'partial'
          }
        ]
      : []),
    {
      name: 'Incorrect',
      percentage: (data.incorrect_count || data.wrong_count || 0) / (data.correct_count + (data.partial_correct_count || 0) + (data.incorrect_count || data.wrong_count || 0)) * 100,
      type: 'incorrect'
    }
  ];

  const [sizeLabel, setSizeLabel] = useState();
  const [sizeFont, setSizeFont] = useState();
  const [lengthText, setLengthText] = useState();
  const [isMobile, setIsMobile] = useState(false);

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

  const getColor = (type) => {
    switch (type) {
      case 'correct':
        return '#1bd659'; // Zielony
      case 'partial':
        return '#E8D33F'; // Żółty
      case 'incorrect':
        return '#ea4b60'; // Czerwony
      default:
        return '#8884d8'; // Domyślny kolor
    }
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
        <Bar dataKey="percentage" barSize={48} radius={[4, 4, 4, 4]}>
          <LabelList
            dataKey="percentage"
            visibility={isMobile ? 'hidden' : 'visible'}
            position="right"
            offset={10}
            formatter={(value) => `${value.toFixed(2)}%`}
          />
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default OpenQuestionChart;
