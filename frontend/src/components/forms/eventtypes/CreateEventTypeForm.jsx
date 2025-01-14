import React, { useState } from 'react';
import Button from "../../Button";
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from "react-toastify";

function CreateEventTypeForm({ onSuccess, onClose, isOpen }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const token = getToken();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:3001/event-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({ name }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.status}`);
      } 
  
      onSuccess(); 
      toast.success(data.message || 'Event type edited successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setName('');
    }
  };

  const handleCancel = () => {
    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create Event Type</h2>
        <X size={24} className="hover:cursor-pointer" onClick={handleCancel}/>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleCreate}>
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="className">Event Type</label>
          <input
            id="className"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="e.g., Exam"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            disabled={loading}
            onClick={handleCancel}
            lassName="!min-w-0 !w-24 tn:!min-w-36"
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

export default CreateEventTypeForm;