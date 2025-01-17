import React, { useState, useEffect } from 'react';
import Button from '../../Button';
import { X, Info, CheckCircle, Hourglass, XCircle } from 'lucide-react';
import Modal from '../../Modal';
import UserRoles from '../../../utils/userRoles';
import { getToken, getUserId } from '../../../utils/UserRoleUtils';
import Tooltip from '../../Tooltip';
import { toast } from 'react-toastify';
import { API_GRADEBOOK_URL } from '../../../utils/config';

const AddAttendanceForm = ({
  isOpen,
  onClose,
  selectedEvent,
  userRole,
  handleSaveAttendance,
  handleLessonUpdate,
  fetchLessonsForClass,
  fetchLessonsForTeacher,
  selectedClass
}) => {
  const [lessonTopic, setLessonTopic] = useState(selectedEvent?.description || '');
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingAttendances, setExistingAttendances] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState({});

  const token = getToken();
  const userId = getUserId();

  useEffect(() => {
    if (isOpen && selectedEvent) {
      setLoading(true);
      setError(null);
      fetch(`${API_GRADEBOOK_URL}/attendance/${selectedEvent.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          return null;
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      })
      .then(data => {
        if (data && data.data.length > 0) {
          const existing = data.data.map(attendance => ({
            id: attendance.id,
            studentId: attendance.student_id,
            status: attendance.was_present 
              ? (attendance.was_late ? 'Late' : 'Present') 
              : 'Absent'
          }));
          setAttendances(existing);
          setExistingAttendances(existing);
          setLessonTopic(selectedEvent.description || '');
        } else {
          const initialAttendances = selectedEvent.students.map(student => ({
            studentId: student.id,
            status: 'Present',
          }));
          setAttendances(initialAttendances);
          setExistingAttendances(null);
          setLessonTopic(selectedEvent.description || '');
        }
      })
      .catch(err => {
        toast.error(err.message || 'An unexpected error occurred.');
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, selectedEvent, token]);

  useEffect(() => {
    if (!isOpen) {
      setAttendanceDetails({});
    }
  }, [isOpen]);

  if (!selectedEvent) return null;

  const handleRadioChange = (studentId, selectedStatus) => {
    setAttendances((prevAttendances) =>
      prevAttendances.map((attendance) =>
        attendance.studentId === studentId
          ? { ...attendance, status: selectedStatus }
          : attendance
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    if (!selectedEvent || !selectedEvent.id) {
      setError('Invalid lesson ID. Please try again.');
      setLoading(false);
      return;
    }
  
    const processedAttendances = attendances.map((attendance) => {
      switch (attendance.status) {
        case 'Present':
          return { 
            id: attendance.id, 
            studentId: attendance.studentId, 
            wasPresent: true, 
            wasLate: false,
            wasExcused: false
          };
        case 'Late':
          return { 
            id: attendance.id,
            studentId: attendance.studentId, 
            wasPresent: true, 
            wasLate: true,
            wasExcused: false
          };
        case 'Absent':
        default:
          return { 
            id: attendance.id,
            studentId: attendance.studentId, 
            wasPresent: false, 
            wasLate: false,
            wasExcused: false
          };
      }
    });
  
    for (const attendance of processedAttendances) {
      if (!attendance.wasPresent && attendance.wasLate) {
        setError(`Invalid attendance status for student ID: ${attendance.studentId}`);
        setLoading(false);
        return;
      }
    }
  
    try {
      await handleLessonUpdate({
        lessonId: selectedEvent.id,
        lessonTopic: lessonTopic, 
      });
  
      if (existingAttendances) {
        await Promise.all(processedAttendances.map(attendance => 
          fetch(`${API_GRADEBOOK_URL}/attendance/${attendance.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              wasPresent: attendance.wasPresent,
              wasLate: attendance.wasLate,
              wasExcused: attendance.wasExcused,
            }),
          })
        ));
      } else {
        await handleSaveAttendance({
          lessonId: selectedEvent.id,
          attendances: processedAttendances,
        });
      }
      
      if(userRole === UserRoles.Administrator){
        fetchLessonsForClass(selectedClass); 
      }
  
      if(userRole === UserRoles.Teacher){
        fetchLessonsForTeacher(userId);
      }
  
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendanceInfo = async (studentId) => {
    if (attendanceDetails[studentId]?.data || attendanceDetails[studentId]?.loading) return;
    
    setAttendanceDetails(prev => ({
      ...prev,
      [studentId]: { data: null, loading: true, error: null }
    }));

    const date = new Date(selectedEvent.date).toISOString().split('T')[0];
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/attendance/student/${studentId}/by-date/${encodeURIComponent(date)}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        }
      });
      if(!response.ok){
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      setAttendanceDetails(prev => ({
        ...prev,
        [studentId]: { data: result.data, loading: false, error: null }
      }));
    } catch(err){
      setAttendanceDetails(prev => ({
        ...prev,
        [studentId]: { data: null, loading: false, error: err.message }
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthHeightClassname="max-w-lg max-h-[48rem]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-textBg-700">Add Information</h2>
        <X size={24} className="hover:cursor-pointer" onClick={onClose}/>
      </div>

      <form className='className="flex flex-col gap-6"' onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="block text-textBg-900 font-medium mb-2">Lesson Topic</label>
          <input
            type="text"
            value={lessonTopic}
            onChange={(e) => setLessonTopic(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Set lesson topic"
            required
            disabled={userRole !== UserRoles.Teacher && userRole !== UserRoles.Administrator}
          />
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label className="block text-textBg-900 font-medium mb-2">Attendance</label>
          <div className="w-full flex mb-2">
            <div className="w-2/5">
              <p className="text-textBg-700 text-sm font-medium">Student Name</p>
            </div>
            <div className="flex justify-end xs:justify-evenly w-3/5 xs:w-[calc(60%-12px)]">
              <div className="hidden xs:flex gap-6">
                <p className="text-textBg-700 text-xs xs:text-base font-medium">Present</p>
                <p className="text-textBg-700 text-xs xs:text-base font-medium">Late</p>
                <p className="text-textBg-700 text-xs xs:text-base font-medium">Absent</p>
              </div>
              <div className="flex gap-[13px] xs:hidden">
                <Tooltip content={
                  <div>
                    <p>Present</p>
                  </div>
                }
                position="top">
                    <div className={`flex items-center justify-center w-5 h-5 rounded bg-[#eefdf3]`}>
                      <CheckCircle size={44} color='#16a34a' />
                    </div>
                </Tooltip>
                <Tooltip content={
                  <div>
                    <p>Late</p>
                  </div>
                }
                position="top">
                    <div className={`flex items-center justify-center w-5 h-5 rounded bg-[#fef9ed]`}>
                      <Hourglass size={44} color='#f59e0b' />
                    </div>
                </Tooltip>
                <Tooltip content={
                  <div>
                    <p>Absent</p>
                  </div>
                }
                position="top">
                    <div className={`flex items-center justify-center w-5 h-5 rounded bg-primary-100`}>
                      <XCircle size={44} color='#ef4444' />
                    </div>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar">
            {selectedEvent.students.map((student) => (
              <div className="w-full flex mb-2" key={student.id}>
                <div className="w-2/5 flex items-center">
                <Tooltip
                  content={
                    <div>
                      <p>{student.first_name} {student.last_name}</p>
                    </div>
                  }
                  position="top">
                  <span className='webkit-box webkit-line-clamp-1 webkit-box-orient-vertical font-medium items-center w-24 xxs:w-28 xs:w-32 overflow-hidden text-ellipsis'>
                    {student.first_name} {student.last_name}
                  </span>
                </Tooltip>

                  <Tooltip 
                    content={
                      attendanceDetails[student.id]?.loading ? "Loading..." :
                      attendanceDetails[student.id]?.error ? `Error: ${attendanceDetails[student.id].error}` :
                      (attendanceDetails[student.id]?.data?.length > 0 ? (
                        <div>
                          {attendanceDetails[student.id].data.map((att, index) => (
                            <div key={index} className="grid grid-cols-2 gap-2">
                              <p className="font-semibold text-textBg-100 text-left">{att.lesson.subject.name}</p>
                              <p className='text-textBg-300 text-right'> {(att.was_present && !att.was_late) ? 'Present' : (att.was_present && att.was_late) ? 'Late' : 'Absent'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>No other attendance records.</div>
                      ))
                    }
                    position="right"
                  >
                    <Info 
                      size={16} 
                      className="ml-2 text-textBg-700 hover:cursor-pointer" 
                      onMouseEnter={() => fetchStudentAttendanceInfo(student.id)}
                    />
                  </Tooltip>
                </div>
                <div className="flex items-center justify-end gap-4 xs:gap-0 xs:justify-evenly w-3/5">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      value="Present"
                      checked={attendances.find(a => a.studentId === student.id)?.status === 'Present'}
                      onChange={() => handleRadioChange(student.id, 'Present')}
                      className="mr-1"
                    />
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      value="Late"
                      checked={attendances.find(a => a.studentId === student.id)?.status === 'Late'}
                      onChange={() => handleRadioChange(student.id, 'Late')}
                      className="mr-1"
                    />
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      value="Absent"
                      checked={attendances.find(a => a.studentId === student.id)?.status === 'Absent'}
                      onChange={() => handleRadioChange(student.id, 'Absent')}
                      className="mr-1"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
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

export default AddAttendanceForm; 