import React, { useState, useEffect } from 'react';
import Button from '../../Button';
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';
import { API_GRADEBOOK_URL } from '../../../utils/config';

function EditQuestionTypeForm({ isOpen, onClose, onSuccess, id, currentName }) {
  const [name, setName] = useState(currentName || '');
  const [loading, setLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    setName(currentName || '');
  }, [currentName]);

  const handleEditType = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/question-type/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      toast.success(data.message || 'The question type was successfully updated.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'An error occurred while updating the question type.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit Question Type</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>
      <form onSubmit={handleEditType} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label htmlFor="editQuestionTypeName" className="text-base text-textBg-700">Type Name</label>
          <input
            id="editQuestionTypeName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="E.g. Closed, Open"
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            onClick={onClose}
            disabled={loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
          <Button
            text={loading ? "Saving..." : "Save"}
            disabled={loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </form>
    </Modal>
  );
}

export default EditQuestionTypeForm;