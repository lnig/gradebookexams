import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { API_GRADEBOOK_URL } from '../../../utils/config';

function CreateGradeForm({ isOpen, onClose, onSuccess, students, lessonId, subjectId, teacherId }) {
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const handleGradeChange = (studentId, value) => {
    setGrades(prevGrades => ({
      ...prevGrades,
      [studentId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    if (weight === '') {
      toast.error('Please enter the weight.');
      setLoading(false);
      return;
    }

    try {
      const gradePromises = Object.entries(grades).map(async ([studentId, grade]) => {
        if (grade === '') return null;

        const response = await fetch(`${API_GRADEBOOK_URL}/grade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            description,
            grade: Number(grade),
            weight: Number(weight),
            studentId,
            subjectId,
            teacherId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return response.json();
      });

      await Promise.all(gradePromises);

      onSuccess();
      handleClose();
      toast.success('Grades added successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setWeight('');
    setGrades({});
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Add Grades</h2>
        <X size={24} className="hover:cursor-pointer" onClick={handleClose}/>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border h-24 border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="Description..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="description">Weight</label>
          <input
            type="number"
            min="1"
            max="3"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="Enter grade weight"
          />
        </div>
        <div>
          <label className="text-base text-textBg-700">Students</label>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {students.map(student => (
              <div key={student.id} className="flex items-center justify-between">
                <p className='text-sm'>{student.first_name} {student.last_name}</p>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={grades[student.id] || ''}
                  onChange={(e) => handleGradeChange(student.id, e.target.value)}
                  className="w-24 text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
                  placeholder="Grade"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            type="secondary" 
            text="Cancel" 
            onClick={handleClose} 
            disabled={loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
          <Button 
            text={loading ? "Creating..." : "Create"}  
            disabled={loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateGradeForm;
