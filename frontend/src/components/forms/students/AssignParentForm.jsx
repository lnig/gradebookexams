import React, { useEffect, useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import Select from 'react-select'; 
import { X } from 'lucide-react';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';
import { API_GRADEBOOK_URL } from '../../../utils/config';

function AssignParentForm({ onSuccess, isOpen, closeModal, studentId, studentName }) {
  const [availableParents, setAvailableParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = getToken();
  
  useEffect(() => {
    if (isOpen) {
      fetchAvailableParents();
    }
  }, [isOpen]);

  const fetchAvailableParents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/parent/available-parents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      const parentsData = result.data.map(parent => ({
        value: parent.id,
        label: `${parent.first_name} ${parent.last_name} (${parent.email})`,
      }));
      setAvailableParents(parentsData);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignParent = async () => {
    if (!selectedParent) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/student-parent/', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          studentId: studentId,
          parentId: selectedParent.value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign parent.');
      }
      const data = await response.json();
      
      onSuccess();
      closeModal();
      toast.success(data.message || 'Parent assigned successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Assign Parent to {studentName}</h2>
        <X size={24} className="hover:cursor-pointer" onClick={closeModal} />
      </div>
      <div>
        {loading && <p>Loading...</p>}
        {!loading && (
          <Select
            options={availableParents}
            onChange={setSelectedParent}
            placeholder="Select a parent to assign"
            className="w-full mb-4"
            isClearable
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Button 
            text="Cancel" 
            type="secondary" 
            onClick={closeModal} 
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
          <Button 
            text="Assign" 
            onClick={handleAssignParent} 
            disabled={!selectedParent || loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </div>
    </Modal> 
  );
}

export default AssignParentForm;
