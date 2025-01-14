import React, { useState, useEffect } from 'react';
import Modal from '../../Modal'; // Adjust the import path as necessary
import Button from '../../Button';
import { toast } from 'react-toastify';
import { getToken } from '../../../utils/UserRoleUtils';
import { X } from 'lucide-react';

const UpdateProblemStatusForm = ({ isOpen, onClose, problem, statuses, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState(problem.statuses?.id || '');
  const [loading, setLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (isOpen && problem) {
      setSelectedStatus(problem.statuses?.id || '');
    }
  }, [isOpen, problem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/problem/${problem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ statusId: selectedStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      toast.success(data.message || 'Status updated successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Update Status</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="status">Status</label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
          >
            <option value="" hidden disabled>Select a status</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
          
        <div className="flex justify-end gap-4">
          <Button 
            text="Cancel" 
            type="secondary"
            disabled={loading} 
            onClick={onClose}
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
};

export default UpdateProblemStatusForm;