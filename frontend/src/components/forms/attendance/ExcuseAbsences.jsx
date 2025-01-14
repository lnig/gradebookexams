import React, { useState } from 'react';
import Modal from '../../Modal';
import Button from '../../Button';
import { X } from 'lucide-react';

function ExcuseAbsences({ isOpen, onClose, onSubmit, selectedDate }) {
  const [excuseType, setExcuseType] = useState('all');
  const [excuseDate, setExcuseDate] = useState(null);

  const handleSubmit = () => {
    onSubmit({ excuseType, excuseDate: excuseType === 'by-date' ? excuseDate : null });
    setExcuseType('all');
    setExcuseDate(selectedDate);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Excuse Absences</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="all"
              checked={excuseType === 'all'}
              onChange={() => setExcuseType('all')}
              className="mr-2"
            />
            All Absences
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="by-date"
              checked={excuseType === 'by-date'}
              onChange={() => setExcuseType('by-date')}
              className="mr-2"
            />
            Specific Date
          </label>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button
            text="Cancel"
            onClick={onClose}
            type="secondary"
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
          <Button
            text="Confirm"
            onClick={handleSubmit}
            className="!min-w-0 !w-24 tn:!min-w-36"
          />
        </div>
      </div>
    </Modal>
  );
}

export default ExcuseAbsences;
