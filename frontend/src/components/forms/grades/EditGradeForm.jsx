import React, { useState, useEffect } from 'react';
import Button from '../../Button';
import Modal from '../../Modal';
import { X } from 'lucide-react';
import { getToken } from '../../../utils/UserRoleUtils';
import { validate as validateUUID } from 'uuid';
import { toast } from 'react-toastify';
import { API_GRADEBOOK_URL } from '../../../utils/config';

const EditGradeForm = ({ grade, isOpen, onSuccess, onClose }) => {
  const [description, setDescription] = useState(grade.description);
  const [gradeValue, setGradeValue] = useState(grade.grade);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  useEffect(() => {
    if (grade) {
      setDescription(grade.description);
      setGradeValue(grade.grade);
    }
  }, [grade]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUUID(grade.id)) {
      setError('Invalid UUID identifier.');
      toast.error('Invalid UUID identifier.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/grade/${grade.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          grade: gradeValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();

      onSuccess(data);
      toast.success(data.message || 'Grade edited successfully.');
    } catch (err) {
      setError(err.message || 'An error occurred while updating the grade.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit Grade</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="grade">Grade</label>
          <input
            type="number"
            id="grade"
            value={gradeValue}
            onChange={(e) => setGradeValue(Number(e.target.value))}
            required
            min="1"
            max="6"
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="secondary"
            btnType="button"
            text="Cancel"
            onClick={onClose}
            disabled={loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
          <Button
            btnType="submit"
            text={loading ? "Saving..." : "Save"}
            disabled={loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditGradeForm;
