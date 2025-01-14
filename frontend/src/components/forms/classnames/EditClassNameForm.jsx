import React, { useState } from 'react';
import Button from '../../Button';
import { validate as validateUUID } from 'uuid';
import Modal from '../../Modal';
import { X } from 'lucide-react';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';

const EditClassNameForm = ({ id, currentName, isOpen, onSuccess, onClose}) => {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUUID(id)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/class-name/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      onSuccess(data);
      toast.success(data.message || 'Class name edited successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Edit Class Name</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose} />
      </div>
      
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="name">Class Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
          />
        </div>
      
        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            type="secondary"
            disabled={loading}
            btnType="button"
            onClick={onClose}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
          <Button
            btnType="submit"
            text={loading ? "Updating..." : "Update"}
            disabled={loading}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditClassNameForm;
