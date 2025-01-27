import React, { useState, useEffect } from 'react';
import Button from "../../Button";
import { X } from 'lucide-react';
import Modal from '../../Modal';
import { getToken } from '../../../utils/UserRoleUtils';
import { toast } from 'react-toastify';
import { API_GRADEBOOK_URL } from '../../../utils/config';

function CreateEventForm({ onSuccess, onClose, isOpen }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventTypeId, setEventTypeId] = useState('');
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();

  const fetchEventTypes = async () => {
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/event-type`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching event types: ${response.status}`);
      }

      const result = await response.json();
      setEventTypes(result.data);
    } catch (err) {
      setError(err.message || 'Failed to load event types.');
      toast.error(err.message || 'An unexpected error occurred.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEventTypes();
    }
  }, [isOpen, token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after start time.');
      toast.error('End time must be after start time.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/school-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          name,
          location,
          description,
          date,
          startTime,
          endTime,
          eventTypeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      const data = await response.json();

      onSuccess(); 
      onClose(); 
      toast.success(data.message || 'Class name deleted successfully.');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setDate('');
      setDescription('');
      setEndTime('');
      setLocation('');
      setName('');  
      setStartTime(''); 
      setEventTypeId(''); 
    }
  };

  const handleCancel = () => {
    setDate('');
    setDescription('');
    setEndTime('');
    setLocation('');
    setName('');  
    setStartTime(''); 
    setEventTypeId('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Create School Event</h2>
        <X size={24} className="hover:cursor-pointer" onClick={handleCancel}/>
      </div>
      
      <form className="flex flex-col gap-6" onSubmit={handleCreate}>
        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="eventName">Event Name</label>
          <input
            id="eventName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="e.g., Science Fair"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="e.g., Auditorium"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full text-textBg-900 min-h-24 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
            placeholder="Describe the event..."
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="startTime">Start Time</label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="endTime">End Time</label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-base text-textBg-700" htmlFor="eventType">Event Type</label>
          <select
            id="eventType"
            value={eventTypeId}
            onChange={(e) => setEventTypeId(e.target.value)}
            required
            className="w-full text-textBg-900 px-3 py-2 border border-textBg-200 rounded text-base focus:outline-none focus:border-textBg-400"
          >
            <option value="" disabled hidden>Select event type</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
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
            btnType="submit"
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateEventForm;
