import React, { useState, useEffect } from 'react';
import {
  dayNames,
  convertTimeToHours,
  getCurrentTimePosition,
  areDatesEqual,
} from '../utils/SchedCalUtils'; 
import { getToken, getUserId, getUserRole } from "../utils/UserRoleUtils"; 
import { Info } from 'lucide-react';
import Tooltip from '../components/Tooltip';
import '../customCSS/customScrollbar.css';
import UserRoles from '../utils/userRoles';
import { formatTime } from '../utils/dateTimeUtils'
import { API_GRADEBOOK_URL } from '../utils/config';

const DashboardSchedule = () => {
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [marginLeft, setMarginLeft] = useState('66px');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [userId, setUserId] = useState(null);

  const parentId = getUserId();
  const token = getToken();
  const userRole = getUserRole();

  const baseDate = new Date();

  const getDateWithOffset = (offset) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + offset);
    return newDate;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setMarginLeft('60px');
      } else {
        setMarginLeft('66px');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchStudentForParent = async () => {
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/student-parent/${parentId}/students`, {
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
      setUserId(result.data);
    } catch (err) {
      console.error("Failed to fetch students for parent:", err.message);
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const backResponse = await fetch(`${API_GRADEBOOK_URL}/lesson/back/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const todayResponse = await fetch(`${API_GRADEBOOK_URL}/lesson/today/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const aheadResponse = await fetch(`${API_GRADEBOOK_URL}/lesson/ahead/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!backResponse.ok || !todayResponse.ok || !aheadResponse.ok) {
        throw new Error('Failed to fetch lessons data.');
      }

      const backData = await backResponse.json();
      const todayData = await todayResponse.json();
      const aheadData = await aheadResponse.json();
      const combinedLessons = [
        ...backData.data, 
        ...todayData.data, 
        ...aheadData.data
      ];

      setLessons(combinedLessons);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching lessons.');
    } finally {
      setLoading(false);
    }
  };

  const colorsArray = [
    { bg: 'bg-[#1A99EE]', text: 'text-[#ffffff]' },
    { bg: 'bg-[#f3f4f6]', text: 'text-[#6f7787]' },
    { bg: 'bg-[#F5C747]', text: 'text-[#ffffff]' },
    { bg: 'bg-[#f1f9fe]', text: 'text-[#0f7bc4]' },
    { bg: 'bg-[#8f5ce7]', text: 'text-[#ffffff]' },
    { bg: 'bg-[#f3fbfa]', text: 'text-[#288679]' },
    { bg: 'bg-[#fff9e6]', text: 'text-[#cfa200]' },
    { bg: 'bg-[#f4faf8]', text: 'text-[#2c644e]' },
    { bg: 'bg-[#fcf3f3]', text: 'text-[#d7655b]' },
    { bg: 'bg-[#f3fcf0]', text: 'text-[#358d21]' },
    { bg: 'bg-[#f3fcf0]', text: 'text-[#358d21]' },
    { bg: 'bg-[#41B029]', text: 'text-[#ffffff]' },
  ];

  const defaultColor = { bg: 'bg-[#cccccc]', text: 'text-[#000000]' };

  const mapLessonsToEvents = (lessons) => {
    const subjectColors = {};
    let colorIndex = 0;
  
    return lessons.map((lesson) => {
      const subjectId = lesson.subject_id;
  
      if (!subjectColors[subjectId]) {
        if (colorIndex < colorsArray.length) {
          subjectColors[subjectId] = colorsArray[colorIndex];
          colorIndex++;
        } else {
          subjectColors[subjectId] = defaultColor;
        }
      }
      const colors = subjectColors[subjectId];
  
      return {
        id: lesson.id,
        title: lesson.subjects.name,
        classId: lesson.class_id,
        subjectId: lesson.subject_id,
        teacherId: lesson.teacher_id,
        startTime: formatTime(lesson.start_time),
        endTime: formatTime(lesson.end_time),
        colors: colors,
        date: new Date(lesson.date),
        students: lesson.students,
        lessonTopic: lesson.description || '',
        isCompleted: lesson.is_completed,
        teacherName: `${lesson.teachers.first_name} ${lesson.teachers.last_name}`,
      };
    });
  };

  const eventsData = mapLessonsToEvents(lessons);

  const currentTimePosition = getCurrentTimePosition();
  const calendarStartHour = 7;
  const calendarEndHour = 18; 
  const calendarHeight = (calendarEndHour - calendarStartHour) * 66;

  const selectedDate = getDateWithOffset(selectedOffset);

  const filteredEvents = eventsData.filter(event => areDatesEqual(event.date, selectedDate));

  useEffect(() => {
    const initializeData = async () => {
      if (userRole === UserRoles.Student) {
        const id = getUserId();
        setUserId(id);
      } else if (userRole === UserRoles.Parent) {
        await fetchStudentForParent();
      }
    };

    initializeData();
  }, [userRole]);

  useEffect(() => { 
    if (userId) {
      fetchLessons();
    }
  }, [userId]);

  return (
    <div className='flex flex-col w-full'>
      <p className="text-textBg-700 font-bold text-2xl mb-6">Calendar</p>
      
      {loading ? (
        <p>Loading lessons...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <>
          <div className="flex flex-nowrap sm:gap-4 mb-6">
            {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
              const currentDate = getDateWithOffset(offset);
              const currentDayOfWeek = currentDate.getDay();
              const dayName = dayNames[(currentDayOfWeek + 6) % 7];
              const dayNumber = currentDate.getDate();
              const isSelected = offset === selectedOffset;
              const isToday = offset === 0;

              return (
                <div key={offset} className="w-full flex flex-col justify-center items-center gap-2">
                  <p className="text-textBg-900 text-sm">{dayName.slice(0, 3)}</p>
                  <p
                    className={`w-8 h-8 text-base flex items-center justify-center cursor-pointer
                    ${isSelected ? 'rounded-full bg-primary-500 text-textBg-100' : 'text-textBg-700 bg-textBg-100'}
                    `}
                    onClick={() => setSelectedOffset(offset)}
                  >
                    {dayNumber}
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="w-full sm:w-full mt-8 max-w-full overflow-x-auto relative">
            <div className="relative" style={{ height: `${calendarHeight}px` }}>
              <div className="grid grid-cols-[auto,1fr] grid-rows-[repeat(11,66px)] w-full h-full">
                {['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(
                  (time, idx) => (
                    <React.Fragment key={`time-row-${idx}`}>
                      <div className="flex justify-end pr-4 text-gray-500 text-xs">
                        {time}
                      </div>
                      <div className={`relative ${idx > 0 ? 'border-x border-b' : 'border'} border-textBg-300`}>
                      </div>
                    </React.Fragment>
                  )
                )}
              </div>

       
              {filteredEvents.map((event, eventIdx) => {
                const eventStart = convertTimeToHours(event.startTime);
                const eventEnd = convertTimeToHours(event.endTime);
                const top = (eventStart - calendarStartHour) * 66;
                const height = (eventEnd - eventStart) * 66;

                return (
                  <div
                    key={event.id}
                    className={`absolute right-[2px] p-2 rounded-sm ${event.colors.bg} ${event.colors.text} cursor-pointer`}
                    style={{ top: `${top + 2}px`, height: `${height - 5}px`, width: 'calc(100% - 76px)' }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className='flex justify-between'>
                      <div>
                        <div className="text-sm font-bold mb-1">
                          {event.title}
                        </div>
                        <div className="text-sm">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                      <div className='flex items-center space-x-2 z-10'>
                        <Tooltip 
                          content={
                            <div className='w-fit'>
                              <div className='flex gap-2 items-start'>
                                <p className="font-semibold text-textBg-100 text-left w-10">Topic:</p>
                                <p>{event.lessonTopic || 'N/A'}</p>
                              </div>
                              <div className='flex gap-2 items-start'>
                                <p className="font-semibold text-textBg-100 text-left w-10">Teacher:</p>
                                <p>{event.teacherName || 'N/A'}</p>
                              </div>
                            </div>
                          } 
                          position="left"
                        >
                          <Info 
                            className="w-4 h-4 text-white cursor-pointer" 
                            strokeWidth={3} 
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })}

              {currentTimePosition < calendarHeight && (
                <div
                  className="absolute right-0 left-8 sm:left-4 flex items-center"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 ml-8 sm:ml-12" />
                  <div className="h-[1px] w-full bg-red-500" />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSchedule;
