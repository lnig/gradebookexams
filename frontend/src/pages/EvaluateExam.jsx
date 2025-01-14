import React, { useEffect, useState } from "react";
import PageTitle from "../components/PageTitle";
import EvaluateItem from "../components/EvaluateItem";
import FilterForm from "../components/FilterForm";
import { useLocation, useNavigate } from 'react-router-dom';
import Button from "../components/Button";
import { toast } from "react-toastify";

export function EvaluateExam() {
    const [studentsToGrade, setStudentsToGrade] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [searchValue, setSearchValue] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    
    const useQuery = () => {
        return new URLSearchParams(location.search);
    };

    const query = useQuery();
    const exam_id = query.get('exam_id');

    useEffect(() => {
        const fetchStudentsToGrade = async () => {
            setLoading(true);
            setError(null);

            if (!exam_id) {
                setError('No exam ID provided.');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/exams/${exam_id}/getAllAttemptsToGrade`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setStudentsToGrade(data.data.students_to_grade);
                    setFilteredStudents(data.data.students_to_grade);
                    setTitle(data.data.exam_name);
                } else {
                    setError(data.message || 'Failed to fetch students to grade.');
                }
            } catch (err) {
                console.error('Error fetching students to grade:', err);
                setError('An unexpected error occurred.');
                toast.error(err.message || "An unexpected error occurred.")
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsToGrade();
    }, [exam_id]);

    const filterOptions = [
        { value: 'name_asc', label: 'Name A-Z' },
        { value: 'name_desc', label: 'Name Z-A' },
        { value: 'score_asc', label: 'Score Ascending' },
        { value: 'score_desc', label: 'Score Descending' },
        { value: 'date_asc', label: 'Date Ascending' },
        { value: 'date_desc', label: 'Date Descending' },
    ];
    const handleSearchChange = (value) => {
        setSearchValue(value);
    };

    const handleFilterChange = (value) => {
        setSelectedFilter(value);
    };

    const sortStudents = (students, filter) => {
        switch(filter) {
            case 'name_asc':
                return [...students].sort((a, b) => a.firstName.localeCompare(b.firstName));
            case 'name_desc':
                return [...students].sort((a, b) => b.firstName.localeCompare(a.firstName));
            case 'score_asc':
                return [...students].sort((a, b) => a.total_score - b.total_score);
            case 'score_desc':
                return [...students].sort((a, b) => b.total_score - a.total_score);
            case 'date_asc':
                return [...students].sort((a, b) => new Date(a.end_time) - new Date(b.end_time));
            case 'date_desc':
                return [...students].sort((a, b) => new Date(b.end_time) - new Date(a.end_time));
            default:
                return students;
        }
    };

    useEffect(() => {
        let filtered = studentsToGrade;
    
        if (searchValue.trim() !== '') {
            const lowerSearch = searchValue.toLowerCase();
            filtered = filtered.filter(student => 
                (student.firstName).toLowerCase().includes(lowerSearch) ||
                (student.firstName).toLowerCase().includes(lowerSearch)
            );
        }
    
        if (selectedFilter !== '') {
            filtered = sortStudents(filtered, selectedFilter);
        }
    
        setFilteredStudents(filtered);
    }, [searchValue, selectedFilter, studentsToGrade]);

    const handleEvaluateAnswers = () => {
        navigate(`/EvaluateAnswers?exam_id=${exam_id}`);
    };

    return (
        <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8 grid">
            <PageTitle text="Evaluate Exam" />
            {loading ? (
                <p className="text-gray-500">Loading results...</p>
            ) : (
                <div className="flex flex-col border border-solid rounded border-textBg-200 p-6 sm:p-8 gap-8">
                    <p className="text-textBg-700 text-2xl lg:text-3xl">{title}</p>             
                        <div className="w-full flex flex-col md:flex-row md:justify-between gap-4">
                            <FilterForm 
                                searchValue={searchValue}
                                onSearchChange={handleSearchChange}
                                filterOptions={filterOptions}
                                selectedFilter={selectedFilter}
                                onFilterChange={handleFilterChange}
                            />
                            <Button 
                                size="m"
                                text="Evaluate Open Answers" 
                                className=''
                                type="primary" 
                                onClick={handleEvaluateAnswers}
                            />
                        </div>
                        {filteredStudents.length > 0 ? (
                        <div className="flex flex-wrap gap-x-12 gap-y-6">
                            {filteredStudents.map(student => (
                                <EvaluateItem
                                    key={student.attemptId}
                                    firstName={student.firstName}
                                    lastName={student.lastName}
                                    endTime={student.end_time}
                                    totalScore={student.total_score}
                                    maxScore={student.max_score}
                                    attemptId={student.attemptId}
                                    attemptNumber={student.attemptNumber}
                                    all={false} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-textBg-500">No students to grade.</p>
                    )}
                </div>
            )}  
        </main>
    );
}

export default EvaluateExam;
