import React, { useState, useEffect } from "react";
import PageTitle from "../components/PageTitle";
import CardGraph from "../components/CardGraph";
import FilterForm from "../components/FilterForm";
import ResponsiveTable from "../components/Table";
import BarChart from "../components/BarChart";
import PieChart from "../components/PieChart";
import QuestionChart from "../components/QuestionChart";
import { useNavigate } from 'react-router-dom';
import { getToken, getUserRole } from "../utils/UserRoleUtils";
import { toast } from "react-toastify";

export default function Results() {
  const [selectedOption, setSelectedOption] = useState("Results");
  const [data, setData] = useState(null);
  const [size, setSize] = useState(100);
  const [intervalVal, setIntervalVal] = useState(0);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [interval, setInterval] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleResize = () => {
    const windowWidth = window.innerWidth;
    
    if (windowWidth < 350) { 
      setSize(150);
    } else if (windowWidth < 400) { 
      setSize(200);
    } else if (windowWidth > 400 && windowWidth < 1024) {
      setSize(250);
    } else if(windowWidth >= 1023 && windowWidth <= 1280){
      setSize(250);
    } else{
      setSize(250)
    }

    if(
      (windowWidth > 1280 && windowWidth < 1536) ||
      (windowWidth < 1150 && windowWidth > 1024) ||
      (windowWidth < 850)
    ){
      setInterval(1);
    } else{
      setInterval(0);
    }
  };
  
  useEffect(() => {
    handleResize(); 
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const queryParams = new URLSearchParams(window.location.search);
  const exam_id = queryParams.get('exam_id');
  const token = getToken();
  const role = getUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/exams/${exam_id}/results`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch results.');
        }

        const resultData = await response.json();
        setData(resultData.data);
        setFilteredStudents(resultData.data.Students);
      } catch (error) {
        toast.error(error.message || "An unexpected error occurred.")
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [exam_id, token]);

  if (!data) {
    return <p className="text-gray-500">Loading results...</p>;
  }

  const handleFilter = ({ searchTerm, minScore, maxScore }) => {
    let filtered = data.Students;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (minScore) {
      filtered = filtered.filter(student => student.total_score >= parseFloat(minScore));
    }

    if (maxScore) {
      filtered = filtered.filter(student => student.total_score <= parseFloat(maxScore));
    }

    setFilteredStudents(filtered);
  };

  const getTotalStudents = (students) => {
    return students.length;
  };
  
  const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return ((part / total) * 100).toFixed(2);
  };
  
  const calculateAverageScore = (students) => {
    if (students.length === 0) return 0;
    const totalPercentage = students.reduce((acc, student) => acc + (student.total_score / student.max_score) * 100, 0);
    const avgPercentage = totalPercentage / students.length;
    return avgPercentage.toFixed(2);
  };
  
  const getMaxScore = (students) => {
    if (students.length === 0) return 0;
    return Math.max(...students.map(student => student.max_score));
  };
  
  const getPassedStudents = (students) => {
    return students.filter(student => (student.total_score / student.max_score) >= 0.5).length;
  };
  
  const getFailedStudents = (students) => {
    return students.filter(student => (student.total_score / student.max_score) < 0.5).length;
  };
  
  const getLowestScore = (students) => {
    if (students.length === 0) return 0;
    const minScore = Math.min(...students.map(student => (student.total_score / student.max_score) * 100));
    return minScore.toFixed(2);
  };
  
  const getBestScore = (students) => {
    if (students.length === 0) return 0;
    const maxScore = Math.max(...students.map(student => (student.total_score / student.max_score) * 100));
    return maxScore.toFixed(2);
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8 grid">
      <PageTitle text="Summary" />
      {loading ? (
        <p className="text-gray-500">Loading results...</p>
      ) : (
        <div className="flex flex-col sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 sm:gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <p className="text-textBg-700 text-2xl lg:text-3xl">
            {data.exam_title}
          </p>
          <div>
            <select
              className="cursor-pointer focus:outline-none bg-transparent text-lg mt-2 mb-6 sm:mb-0"
              value={selectedOption}
              onChange={handleSelectChange}
            >
              <option value="Results">Results</option>
              <option value="Statistics">Statistics</option>
            </select>
          </div>
        </div>

        {selectedOption === "Results" ? (
          <div>
            <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 2xl:grid-cols-4">
              <CardGraph 
                text="Students Attended" 
                percentage={calculatePercentage(data.Students.length, getTotalStudents(data.Students))}
                attended={data.Students.length} 
                total={getTotalStudents(data.Students)} 
                background="#bbe0f9" 
                foreground="#1a98ed" 
              />

              <CardGraph 
                text="Average Score" 
                percentage={calculateAverageScore(data.Students)}
                background="#fcecc2" 
                foreground="#e8ad0b" 
              />

              <CardGraph 
                text="Passed Students" 
                percentage={calculatePercentage(getPassedStudents(data.Students), getTotalStudents(data.Students))}
                attended={getPassedStudents(data.Students)} 
                total={getTotalStudents(data.Students)} 
                background="#b7f4cd" 
                foreground="#1bd659" 
              />

              <CardGraph 
                text="Failed Students" 
                percentage={calculatePercentage(getFailedStudents(data.Students), getTotalStudents(data.Students))}
                attended={getFailedStudents(data.Students)} 
                total={getTotalStudents(data.Students)} 
                background="#f9c7cd" 
                foreground="#ea4b60" 
              />
            </div>

            <div className="mt-8">
              <FilterForm onFilter={handleFilter} />
              <div className="mb-6"></div>
              <ResponsiveTable students={filteredStudents}
                result={true}
              />
            </div>    
           
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-8 xl:flex-row">
              <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8 w-full xl:w-1/3 2xl:w-1/4">
                <p className="font-bold text-2xl mb-12 text-textBg-700 text-center">Average Score</p>
                <div className="flex flex-col mb-8 sm:mb-16 justify-center items-center">
                  <PieChart 
                    percentage={calculateAverageScore(data.Students)}
                    inside 
                    background="#bbe1fa" 
                    foreground="#1A99EE" 
                    size={size} 
                    strokeWidth={6} 
                  />
                </div>
                <div className="flex flex-col gap-4 w-fit mx-auto">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 rounded-full bg-primary-500"></div>
                      <p className="mr-2">Lowest Score</p>
                    </div>
                    <div className="px-6 py-1 bg-primary-100 rounded-full">
                      <p className="text-sm text-primary-500">{getLowestScore(data.Students)}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-2 rounded-full bg-green-500"></div>
                      <p className="mr-2">Best Score</p>
                    </div>
                    <div className="px-6 py-1 bg-green-100 rounded-full">
                      <p className="text-sm text-green-700">{getBestScore(data.Students)}%</p>
                    </div>
                  </div>
                </div> 
              </div>
            
              <div className="flex flex-col sm:border sm:border-solid rounded border-textBg-200 sm:px-8 sm:pt-8 sm:pb-4 w-full xl:w-2/3 2xl:w-3/4">
                <p className="font-bold text-2xl mb-12 text-textBg-700 text-center">Advanced Results</p>
                <div className="flex flex-col justify-center items-center">
                  <BarChart 
                    interval={intervalVal}
                    statistics={data.Statistics}
                  />
                </div>           
              </div>
            </div>

            {data.Statistics.closedQuestions.map((question, index) => (
              <QuestionChart 
                key={`closed-${index}`} 
                questionNumber={index + 1} 
                questionTitle={question.description}
                data={question.answers}
                type="closed"
              />
            ))}

            {data.Statistics.openQuestions.map((question, index) => (
              <QuestionChart
                key={`open-${index}`}
                questionNumber={data.Statistics.closedQuestions.length + index + 1}
                questionTitle={question.description}
                data={question}
                type="open"
              />
            ))}


          </div>
        )}
      </div>
      )}
    </main>
  );
}
