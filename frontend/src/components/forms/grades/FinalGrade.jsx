import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import { API_GRADEBOOK_URL } from '../../../utils/config';

function FinalGradeForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  studentId, 
  teacherId, 
  subjectId, 
  semesterId,
  existingFinalGrade
}) {
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (existingFinalGrade) {
      setGrade(existingFinalGrade.grade);
    } else {
      setGrade('');
    }
  }, [existingFinalGrade]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!grade) {
      toast.error('Please enter a grade.');
      setLoading(false);
      return;
    }

    if (grade < 1 || grade > 6) {
      toast.error('Grade must be between 1 and 6.');
      setLoading(false);
      return;
    }

    if (!semesterId || !subjectId || !teacherId) {
      toast.error('Please ensure all required fields are selected.');
      setLoading(false);
      return;
    }

    try {
      const url = existingFinalGrade 
        ? `${API_GRADEBOOK_URL}/grade/final/${existingFinalGrade.id}`
        : `${API_GRADEBOOK_URL}/grade/final`;
      
      const method = existingFinalGrade ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          grade: Number(grade),
          studentId,
          subjectId,
          teacherId,
          semesterId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      toast.success(existingFinalGrade ? 'Final grade updated successfully.' : 'Final grade added successfully.');
      onSuccess(data);
      handleClose();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGrade('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">{existingFinalGrade ? 'Edit Final Grade' : 'Add Final Grade'}</h2>
        <X size={24} className="hover:cursor-pointer" onClick={handleClose}/>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-base text-textBg-700" htmlFor="grade">Final Grade</label>
          <input
            type="number"
            id="grade"
            name="grade"
            min="1"
            max="6"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="Enter grade (1-6)"
            required
          />
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
            text={existingFinalGrade ? "Save" : "Create"} 
            disabled={loading || !grade} 
            lassName="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </form>
    </Modal>
  );
}

export default FinalGradeForm;
