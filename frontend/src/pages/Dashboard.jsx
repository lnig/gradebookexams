import React, { useState, useEffect } from "react";
import PageTitle from '../components/PageTitle';
import { ChevronRight, NotepadText } from 'lucide-react';
import GradeCard from "../components/GradeCard";
import AttendanceChart from "../components/BarChartGradebook";
import HomeworkCard from "../components/HomeworkCard";
import DashboardSchedule from "../components/DashboardSchedule";
import { Link } from "react-router-dom";
import { getToken, getUserId, getUserRole } from "../utils/UserRoleUtils";
import UserRoles from "../utils/userRoles";
import { formatTime, formatDate } from "../utils/dateTimeUtils";
import { API_GRADEBOOK_URL } from "../utils/config";

export function Dashboard() {
  const [latestHomework, setLatestHomework] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [latestGrades, setLatestGrades] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loadingLatestHomework, setLoadingLatestHomework] = useState(false);
  const [errorLatestHomework, setErrorLatestHomework] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [latestGradesLoading, setLatestGradesLoading] = useState(false);
  const [latestGradesError, setLatestGradesError] = useState(null);
  const [upcomingExamsLoading, setUpcomingExamsLoading] = useState(false);
  const [upcomingExamsError, setUpcomingExamsError] = useState(null);

  const [studentId, setStudentId] = useState(null);

  const parentId = getUserId();
  const token = getToken();
  const userRole = getUserRole();

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
      setStudentId(result.data);
    } catch (err) {
      console.error("Failed to fetch students for parent:", err.message);
    }
  };

  const fetchLatestHomework = async (studentId) => {
    setLoadingLatestHomework(true);
    setErrorLatestHomework(null);
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/homework/latest/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status}`);
      }

      setLatestHomework(result.data);
    } catch (err) {
      setErrorLatestHomework(err.message);
    } finally {
      setLoadingLatestHomework(false);
    }
  };

  const fetchAttendanceData = async (studentId) => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/attendance/statistics/${studentId}`, {
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
      const transformedData = transformAttendanceData(result.data);
      setAttendanceData(transformedData);
    } catch (err) {
      setAttendanceError(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const transformAttendanceData = (data) => {
    const academicMonths = [
      'September', 'October', 'November', 'December',
      'January', 'February', 'March', 'April',
      'May', 'June'
    ];
  
    return academicMonths.map((month) => {
      const monthData = data[month] || { present: 0, late: 0, absent: 0 };
      const presence = monthData.present + monthData.late + monthData.excused;
      const absent = monthData.absent;
  
      return {
        name: month.substring(0, 3),
        Presence: presence,
        Absent: absent,
      };
    });
  };

  const fetchLatestGrades = async (studentId) => {
    setLatestGradesLoading(true);
    setLatestGradesError(null);
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/grade/latest/${studentId}`, {
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
      setLatestGrades(result.data);
    } catch (err) {
      setLatestGradesError(err.message);
    } finally {
      setLatestGradesLoading(false);
    }
  };

  const fetchUpcomingExams = async (studentId) => {
    setUpcomingExamsLoading(true);
    setUpcomingExamsError(null);
    try {
      const response = await fetch(`${API_GRADEBOOK_URL}/exam/upcoming/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Error: ${response.status}`);
      }
      console.log(result.data);
      setUpcomingExams(result.data);
    } catch (err) {
      setUpcomingExamsError(err.message);
    } finally {
      setUpcomingExamsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (userRole === UserRoles.Student) {
        const id = getUserId();
        setStudentId(id);
      } else if (userRole === UserRoles.Parent) {
        await fetchStudentForParent();
      }
    };

    initializeData();
  }, [userRole]);

  useEffect(() => {
    if (studentId) {
      fetchLatestHomework(studentId);
      fetchAttendanceData(studentId);
      fetchLatestGrades(studentId);
      fetchUpcomingExams(studentId);
    }
  }, [studentId]);

  return (
    <main className="flex-1 mt-12 lg:mt-0 lg:ml-64 pt-3 pb-8 px-6 sm:px-8">
      <PageTitle text="Home" />
      <div className="flex flex-col 2xl:flex-row justify-between sm:border sm:border-solid sm:rounded sm:border-textBg-200 sm:p-8 gap-8 2xl:gap-16">
        <div className="flex flex-col w-full justify-between gap-8">
          <div className="flex flex-col lg:flex-row gap-8 2xl:gap-16 w-full">
            {/* Upcoming Exams */}
            <div className="lg:w-auto lg:flex-shrink-0">
              <p className="text-textBg-700 font-bold text-2xl mt-4 sm:mt-0 mb-6">Upcoming Exams</p>
              <div className="flex flex-wrap lg:flex-col gap-y-4 gap-x-8 mb-4">
                {upcomingExamsLoading ? (
                  <p>Loading exams...</p>
                ) : upcomingExamsError ? (
                  <p className="text-red-500">Error: {upcomingExamsError}</p>
                ) : upcomingExams.length > 0 ? (
                  upcomingExams.map((exam) => (
                    <div key={exam.id} className="w-full">
                      <div className="flex items-center w-fit gap-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center bg-[#d3cafa]`}>
                          <NotepadText size={40} color="#7051EE" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-textBg-700 text-lg font-bold">{exam.topic}</p>
                            <div className="flex lg:flex-col xl:flex-row">
                                <p className="text-textBg-700 text-sm">{formatDate(exam.lesson.date)}</p>
                                <span className="mx-1 text-textBg-700 text-sm lg:hidden xl:block">|</span>
                                <p className="text-textBg-700 xl:text-textBg-700 lg:text-textBg-500 text-sm lg:text-xs xl:text-sm">{formatTime(exam.lesson.start_time)}</p>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No upcoming exams</p>
                )}
              </div>
              <Link to={`/calendar`}>
                <div className="flex items-center justify-center gap-2 pt-2 lg:pt-0">
                  <p className="text-textBg-700 text-sm hover:cursor-pointer">See More</p>
                  <ChevronRight color="#323743" size={20} />
                </div>
              </Link>
            </div>

            {/* Last Grades and Homework */}
            <div className="flex flex-col flex-grow gap-8">
              {/* Last Grades */}
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-textBg-700 font-bold text-2xl mb-6">Last Grades</p>
                  <Link to={`/grades`}>
                    <p className="text-textBg-700 text-sm underline hover:cursor-pointer">See All Grades</p>
                  </Link>
                </div>
                <div className="flex flex-col sm:flex-row w-full gap-4">
                  {latestGradesLoading ? (
                    <p>Loading grades...</p>
                  ) : latestGradesError ? ( 
                    <p className="text-red-500">Error: {latestGradesError}</p>
                  ) : latestGrades.length > 0 ? (
                    latestGrades.map((grade) => (
                      <div key={grade.id} className="w-full">
                        <GradeCard
                          title={grade.description}
                          subtitle={grade.description}
                          grade={grade.grade}
                          bgColor="bg-[#f1f9fe]"
                          textColor="text-[#1A99EE]"
                        />
                      </div>
                    ))
                  ) : (
                    <p>No grades available.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                {/* Homework */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-textBg-700 font-bold text-2xl">Homework</p>
                    <Link to={`/homework`}>
                      <p className="text-textBg-700 text-sm underline hover:cursor-pointer">See All Homework</p>
                    </Link>
                  </div>
                  {loadingLatestHomework ? (
                    <p>Loading homework...</p>
                  ) : errorLatestHomework ? (
                    <p className="text-red-500"> {errorLatestHomework}</p>
                  ) : latestHomework ? (
                      <HomeworkCard
                        key={latestHomework.id}
                        id={latestHomework.id}
                        subject={latestHomework.subject_name}
                        title={latestHomework.description}
                        dueDate={latestHomework.deadline}
                      />
                  ) : (
                    <p>No homework available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <p className="text-textBg-700 font-bold text-2xl">Attendance</p>
            {attendanceLoading ? (
              <p>Loading attendance data...</p>
            ) : attendanceError ? (
              <p className="text-red-500">Error: {attendanceError}</p>
            ) : attendanceData.length > 0 ? (
              <AttendanceChart data={attendanceData} />
            ) : (
              <p>No attendance data available.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <DashboardSchedule />
        </div>
      </div>
    </main>
  );
}
