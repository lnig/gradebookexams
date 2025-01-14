import React, { useState } from 'react';
import Button from '../../Button';
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';
import { API_GRADEBOOK_URL } from '../../../utils/config';

function CreateQuestionTypeForm({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const token = getToken();

  const handleCreateType = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/question-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Error: ${response.status}`);
      }

      const data = await response.json();

      toast.success(data.message || 'The question type was successfully created.');
      onSuccess();
      setName('');
      onClose();
    } catch (err) {
      toast.error(err.message || 'An error occurred while creating the question type.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create Question Type</h2>
        <X size={24} className="hover:cursor-pointer" onClick={handleCancel} />
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleCreateType}>
        <div className="flex flex-col gap-1">
          <label htmlFor="questionTypeName" className="text-base text-textBg-700">Type Name</label>
          <input
            id="questionTypeName"
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
            disabled={loading}
            onClick={handleCancel}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
          <Button
            text={loading ? "Creating..." : "Create"}
            type="primary"
            disabled={loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateQuestionTypeForm;