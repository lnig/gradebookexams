import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus, Pen, Trash } from 'lucide-react';
import Button from "../components/Button";
import SurveyCard from "../components/SurveyCard";
import CreateSurveyForm from "../components/forms/surveys/CreateSurveyForm";
import { getToken, getUserRole } from '../utils/UserRoleUtils';
import { toast } from "react-toastify";
import CreateQuestionTypeForm from "../components/forms/questiontypes/CreateQuestionTypeForm";
import EditQuestionTypeForm from "../components/forms/questiontypes/EditQuestionTypeForm";
import ConfirmForm from "../components/forms/ConfirmForm";
import UserRoles from "../data/userRoles";

function Surveys() {
  const [activeTab, setActiveTab] = useState('surveys');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [isCreateSurveyModalOpen, setIsCreateSurveyModalOpen] = useState(false);
  const [isCreateQuestionTypeModalOpen, setIsCreateQuestionTypeModalOpen] = useState(false);
  const [currentEditQuestionType, setCurrentEditQuestionType] = useState(null);
  const [isEditQuestionTypeModalOpen, setIsEditQuestionTypeModalOpen] = useState(false);
  const [currentDeleteQuestionType, setCurrentDeleteQuestionType] = useState(null);
  const [isDeleteQuestionTypeConfirmOpen, setIsDeleteQuestionTypeConfirmOpen] = useState(false);
  
  const token = getToken();
  const userRole = getUserRole();

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/survey', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setSurveys(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred while fetching surveys.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/question-type', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setQuestionTypes(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred while fetching question types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === UserRoles.Student || userRole === UserRoles.Administrator){
      fetchSurveys();
    }
    if (userRole === UserRoles.Administrator){
      fetchQuestionTypes();
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredAndSortedSurveys = useMemo(() => {
    const filtered = surveys.filter(survey =>
      survey.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (sortOption === 'name-asc') {
        return nameA.localeCompare(nameB);
      } else if (sortOption === 'name-desc') {
        return nameB.localeCompare(nameA);
      } else {
        return 0;
      }
    });

    return sorted;
  }, [searchTerm, sortOption, surveys]);

  const openCreateSurveyModal = () => setIsCreateSurveyModalOpen(true);
  const closeCreateSurveyModal = () => setIsCreateSurveyModalOpen(false);

  const openCreateQuestionTypeModal = () => setIsCreateQuestionTypeModalOpen(true);
  const closeCreateQuestionTypeModal = () => setIsCreateQuestionTypeModalOpen(false);

  const openEditQuestionTypeModal = (questionType) => {
    setCurrentEditQuestionType(questionType);
    setIsEditQuestionTypeModalOpen(true);
  };
  const closeEditQuestionTypeModal = () => {
    setIsEditQuestionTypeModalOpen(false);
    setCurrentEditQuestionType(null);
  };

  const openDeleteQuestionTypeConfirm = (questionType) => {
    setCurrentDeleteQuestionType(questionType);
    setIsDeleteQuestionTypeConfirmOpen(true);
  };

  const closeDeleteQuestionTypeConfirm = () => {
    setIsDeleteQuestionTypeConfirmOpen(false);
    setCurrentDeleteQuestionType(null);
  };

  const handleConfirmQuestionTypeDelete = async () => {
    if (!currentDeleteQuestionType) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/question-type/${currentDeleteQuestionType.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      toast.success('Question type deleted successfully.');
      fetchQuestionTypes();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      closeDeleteQuestionTypeConfirm();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
        <div className="flex items-center justify-between">
            <PageTitle text="Surveys" />
            {userRole === UserRoles.Administrator && (
               <nav className="flex gap-4 mb-5">
               <Button 
                   text="Surveys"
                   type={activeTab === 'surveys' ? 'tertiary' : 'link'}
                   onClick={() => setActiveTab('surveys')}
               />
               <Button 
                   text="Question Type"
                   type={activeTab === 'questionType' ? 'tertiary' : 'link'}
                   onClick={() => setActiveTab('questionType')}
               />
           </nav>
            )} 
        </div>

      {activeTab === 'surveys' && (
        <>
          <div className='flex flex-col md:flex-row gap-4 flex-wrap mb-6 justify-between'>
            <div className="flex flex-col tn:flex-row items-center gap-4">
              <div className="flex h-9 w-full md:w-64 items-center px-3 py-2 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
                <Search size={20} className='mr-2 text-textBg-600' />
                <input
                  type='text'
                  placeholder='Search surveys'
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full focus:outline-none lg:text-base placeholder:text-textBg-600"
                />
              </div>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="h-9 w-full md:w-56 px-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600 focus:outline-none"
              >
                <option value="" disabled hidden>Sort by</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
            {userRole === UserRoles.Administrator && (
            <div className='w-full md:w-auto'>
              <Button
                size="m"
                icon={<Plus size={16} />}
                text="Create Survey"
                className='w-full md:w-auto'
                type="primary"
                onClick={openCreateSurveyModal}
              />
            </div>
            )}
          </div>

          {loading ? (
            <p className="text-textBg-900 text-lg">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedSurveys.length > 0 ? (
                filteredAndSortedSurveys.map(survey => (
                  <SurveyCard
                    key={survey.id}
                    id={survey.id}
                    name={survey.name}
                    description={survey.description}
                    startTime={survey.start_time}
                    endTime={survey.end_time}
                    questions={survey.questions}
                  />
                ))
              ) : (
                <p className="text-textBg-900 text-lg">No surveys found.</p>
              )}
            </div>
          )}

            <CreateSurveyForm
            isOpen={isCreateSurveyModalOpen}
            onSuccess={() => {
                fetchSurveys();
                closeCreateSurveyModal();
            }}
            onClose={closeCreateSurveyModal}
            questionTypes={questionTypes}
            />
        </>
      )}

      {activeTab === 'questionType' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Question Types</h2>
            <Button 
              icon={<Plus size={16} />}
              onClick={openCreateQuestionTypeModal} 
              type="secondary"
              className="min-w-0 w-9 h-9"
            />
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {questionTypes.length > 0 ? (
                questionTypes.map((questionType) => (
                  <div key={questionType.id} className="border px-4 py-2 rounded flex justify-between items-center">
                    <p className='font-medium'>{questionType.name}</p>
                    <div className="flex space-x-2">
                      <Button 
                        icon={<Pen size={16} color='#1A99EE'/>} 
                        type="link" 
                        onClick={() => openEditQuestionTypeModal(questionType)}
                        aria-label={`Edit ${questionType.name}`}
                      />
                      <Button 
                        icon={<Trash size={16} color='#FF4D4F'/>} 
                        type="link" 
                        onClick={() => openDeleteQuestionTypeConfirm(questionType)}
                        aria-label={`Delete ${questionType.name}`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>No question types available.</p>
              )}
            </div>
          )}

          <CreateQuestionTypeForm
            isOpen={isCreateQuestionTypeModalOpen}
            onSuccess={() => {
              fetchQuestionTypes();
              closeCreateQuestionTypeModal();
            }}
            onClose={closeCreateQuestionTypeModal}
          />

          {currentEditQuestionType && (
            <EditQuestionTypeForm
              id={currentEditQuestionType.id}
              currentName={currentEditQuestionType.name}
              isOpen={isEditQuestionTypeModalOpen}
              onSuccess={() => {
                fetchQuestionTypes();
                closeEditQuestionTypeModal();
              }}
              onClose={closeEditQuestionTypeModal}
            />
          )}

          {currentDeleteQuestionType && (
            <ConfirmForm
              isOpen={isDeleteQuestionTypeConfirmOpen}
              onClose={closeDeleteQuestionTypeConfirm}
              onConfirm={handleConfirmQuestionTypeDelete}
              title="Delete Question Type"
              message={`Are you sure you want to delete the question type "${currentDeleteQuestionType.name}"?`}
            />
          )}
        </>
      )}
    </main>
  );
}

export default Surveys;