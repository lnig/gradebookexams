import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExamCard from '../components/ExamCard';
import { Plus } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import Button from '../components/Button';
import UserRoles from '../utils/userRoles';
import FilterForm from '../components/FilterForm';
import { getToken, getUserRole } from "../utils/UserRoleUtils";
import { toast } from 'react-toastify'
import { API_EXAMS_URL } from "../utils/config";

export const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

  const token = getToken();
  const navigate = useNavigate();
  const role = getUserRole();

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_EXAMS_URL}/exams/getExams`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch exams.');
        }

        const data = await response.json();
        setExams(data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load exams.');
        toast.error(err.message || 'Failed to load exams.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [token]);

  const handleViewResults = (examId) => {
    if (examId) {
      navigate(`/exam-results/${examId}`);
    } else {
      console.error('Invalid exam ID:', examId);
    }
  };

  const determineExamType = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_date_time);
    const end = new Date(exam.end_date_time);

    if (now < start) return 'starting';
    if (now >= start && now <= end) return 'active';
    return 'ended';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const handleCreate = () => {
    navigate('/create-exam/s1');
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "starting", label: "Starting Soon" },
    { value: "ended", label: "Ended" },
  ];

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const examType = determineExamType(exam);
    const matchesFilter = selectedFilter === "all" || selectedFilter === "" || examType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="My tests"/>
      <div className='flex flex-wrap justify-between mb-8'>
        <div className='w-full md:w-auto'>
          <FilterForm
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            filterOptions={filterOptions}
            selectedFilter={selectedFilter}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className='w-full md:w-auto mt-4 md:mt-0'>
          {role === UserRoles.Teacher &&
            <Button 
              size="m" 
              text="Create Exam" 
              icon={<Plus size={16} />} 
              className='w-full md:w-auto' 
              type="primary" 
              onClick={handleCreate}
            />
          }
        </div>
      </div>
      {loading && <p className="text-gray-500">Loading exams...</p>}
      <div className='flex flex-wrap gap-8'>
        {filteredExams.map((exam) => (
          <ExamCard
            key={exam.id}
            type={determineExamType(exam)}
            endDate={formatDate(exam.end_date_time)}
            startDate={formatDate(exam.start_date_time)}
            title={exam.title}
            description={exam.description}
            questionsCount={exam.questionsCount}
            duration={exam.duration}
            examId={exam.id}
          />
        ))}
      </div>
    </main>
  );
}

export default Home;