import React, { useState, useEffect, useMemo } from "react";
import PageTitle from '../components/PageTitle';
import { Search, Plus } from 'lucide-react';
import Button from "../components/Button";
import SubjectOrEventTypeCard from "../components/SubjectOrEventTypeCard";
import { validate as validateUUID } from 'uuid'; 
import { getToken } from '../utils/UserRoleUtils';
import ConfirmForm from '../components/forms/ConfirmForm';
import CreateEventTypeForm from "../components/forms/eventtypes/CreateEventTypeForm";
import EditEventTypeForm from "../components/forms/eventtypes/EditEventTypeForm";
import { toast } from "react-toastify";
import { API_GRADEBOOK_URL } from "../utils/config";

export function EventTypes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [events, setEvents] = useState([]);
  const token = getToken();

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/event-type`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setEvents(result.data);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredAndSortedData = useMemo(() => {
    const filtered = events.filter(type =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (sortOption === 'name-asc') {
        return nameA.localeCompare(nameB);
      } else if (sortOption === 'name-desc') {
        return nameB.localeCompare(nameA);
      } else {
        return 0;
      }
    });

    return sorted;
  }, [searchTerm, sortOption, events]);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (id, name) => {
    if (!validateUUID(id)) {
      return;
    }
    setEditingType({ id, name });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingType(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (id) => {
    if (validateUUID(id)) {
      setTypeToDelete(id);
      setIsDeleteModalOpen(true);
    }
  };

  const closeDeleteModal = () => {
    setTypeToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!typeToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/event-type/${typeToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      setEvents(prev => prev.filter(type => type.id !== typeToDelete));
      toast.success(data.message || 'Event type deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      closeDeleteModal();
    }
  };

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Event Types"/>

      <div className='flex flex-col md:flex-row gap-4 flex-wrap mb-6 justify-between'>
        <div className="flex flex-col tn:flex-row items-center gap-4">
          <div className="flex h-9 w-full md:w-64 items-center px-3 py-2 bg-white rounded border border-solid border-textBg-200 text-textBg-600">
            <Search size={20} className='mr-2 text-textBg-600' />
            <input
              type='text'
              placeholder='Search Event Types'
              value={searchTerm}
              onChange={handleSearch}
              className="w-full focus:outline-none lg:text-base placeholder:text-textBg-600"
            />
          </div>

          <select
            value={sortOption}
            onChange={handleSortChange}
            className="h-9 w-full md:w-56 px-3 bg-white rounded border border-solid border-textBg-200 text-textBg-600 focus:outline-none"
          >
            <option value="" disabled hidden>Sort By</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
        <div className='w-full md:w-auto'>
          <Button
            size="m"
            icon={<Plus size={16} />}
            text="Create Event Type"
            className='w-full md:w-auto'
            type="primary"
            onClick={openCreateModal}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-textBg-900 text-lg">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedData.length > 0 ? (
            filteredAndSortedData.map(type => (
              <SubjectOrEventTypeCard
                key={type.id}
                id={type.id}
                name={type.name}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))
          ) : (
            <p className="text-textBg-900 text-lg">No event types found.</p>
          )}
        </div>
      )}

      <CreateEventTypeForm
        isOpen={isCreateModalOpen}
        onSuccess={() => {
          fetchTypes(); 
          closeCreateModal();
        }}
        onClose={closeCreateModal}
      />

      {editingType && (
        <EditEventTypeForm
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          id={editingType.id}
          currentName={editingType.name}
          onSuccess={() => {
            fetchTypes();
            closeEditModal();
          }}
        />
      )}

      <ConfirmForm
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this event type? This action is irreversible."
      />
    </main>
  );
}

export default EventTypes;
