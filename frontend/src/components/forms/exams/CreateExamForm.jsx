import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

function CreateExamForm({ isOpen, onClose, onSuccess, lessonId }) {
  const [topic, setTopic] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!topic || !scope) {
      toast.error('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          scope,
          lessonId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();

      onSuccess();
      handleClose();
      toast.success(data.message || 'Exam created successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTopic('');
    setScope('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create Exam</h2>
        <X size={24} className="hover:cursor-pointer" onClick={handleClose}/>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="topic">Exam Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="Enter exam topic"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="scope">Scope</label>
          <textarea
            id="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="Enter exam scope..."
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
            text="Create" 
            disabled={loading} 
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateExamForm;
