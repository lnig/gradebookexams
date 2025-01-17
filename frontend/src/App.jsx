import React, { useEffect, useState, createContext } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Sidebar, { SidebarItem } from './components/Sidebar';
import Topbar from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Schedule } from './pages/Schedule';
import { Messages } from './pages/Messages';
import { CalendarEvents } from './pages/CalendarEvents';
import { Attendance } from './pages/Attendance';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { Homework } from './pages/Homework';
import HomeworkDetail from './pages/HomeworkDetail';
import { Grades } from './pages/Grades';
import { Classes } from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import UserRoles from './utils/userRoles';
import { getToken, getUserRole, decodeToken, getUserId } from './utils/UserRoleUtils';
import { Students } from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import ClassNames from './pages/ClassNames';
import SchoolYears from './pages/SchoolYears';
import SchoolYearsDetails from './pages/SchoolYearDetails';
import { SocketProvider } from './contexts/SocketContext';
import { Subjects } from './pages/Subjects';
import EventTypes from './pages/EventTypes';
import { Problems } from './pages/Problems';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { Home } from './pages/Home';
import EditExamBasicInfo from './pages/EditExamBasicInfo';
import EditQuestions from './pages/EditQuestions';
import EditParticipants from './pages/EditParticipants';
import EditExamDetailedInfo from './pages/EditExamDetailedInfo';
import ReviewingExam from './pages/ReviewingExam';
import { SolvingExam } from './pages/SolvingExam';
import { EvaluateExam } from './pages/EvaluateExam';
import { EvaluateAnswers } from './pages/EvaluateAnswers';
import Results from './pages/Results';
import { ExamDetails } from './pages/ExamDetails';
import CreateExam from "./pages/CreateExam";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Surveys from './pages/Surveys';
import SurveyDetails from './pages/SurveyDetails';

export const AuthContext = createContext();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const userRole = getUserRole();
  const navigate = useNavigate();
  const token = getToken();
  const userId = getUserId();

  useEffect(() => {
    const isAuthRoute = ['/forgot-password', '/login'].includes(location.pathname) || location.pathname.startsWith('/reset-password');
  
    if (isAuthRoute) return;
  
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setAuthState(true);
      } else {
        clearAuthState();
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);
  
  const setAuthState = (isAuthenticated) => {
    setIsAuthenticated(isAuthenticated);
  };
  
  const clearAuthState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setAuthState(false);
  };
  
  const handleLogout = () => {
    clearAuthState();
    navigate('/login');
  };
  

  return (
    <SocketProvider>
       <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
        draggable
      />
      <AuthContext.Provider value={{ isAuthenticated, userRole, userId, handleLogout }}>
        {isAuthenticated && (
          <Topbar bellNot onLogout={handleLogout}/>
        )}
        <div className="flex">
          {isAuthenticated && (
            <Sidebar onLogout={handleLogout}>
              {userRole !== UserRoles.Parent && (
                <SidebarItem icon={<LayoutDashboard size={20} />} text="Exams" path="/exams" />
              )}
              {(userRole === UserRoles.Student || userRole === UserRoles.Parent) && (
                <>
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Home" path="/dashboard" active />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Schedule" path="/schedule" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Messages" path="/messages" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Calendar" path="/calendar" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Attendance" path="/attendance" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Homework" path="/homework" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Grades" path="/grades" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Problems" path="/problems" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Surveys" path="/surveys" />
                </>
              )}
              {userRole === UserRoles.Teacher && (
                <>
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Attendance" path="/attendance" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Students" path="/students" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Classes" path="/classes" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Schedule" path="/schedule" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Messages" path="/messages" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Homework" path="/homework" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Calendar" path="/calendar" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Grades" path="/grades" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Problems" path="/problems" />
                </>
              )}  
              
              {userRole === UserRoles.Administrator && (
                <>
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Event Types" path="/event-types" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Attendance" path="/attendance" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Students" path="/students" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Classes" path="/classes" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Schedule" path="/schedule" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Class Names" path="/class-names" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="School Years" path="/school-years" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Messages" path="/messages" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Subjects" path="/subjects" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Homework" path="/homework" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Calendar" path="/calendar" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Problems" path="/problems" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Grades" path="/grades" />
                  <SidebarItem icon={<LayoutDashboard size={20} />} text="Surveys" path="/surveys" />
                </>
              )}
              
              <SidebarItem
                icon={<LogOut size={20} />}
                text="Logout"
                path="#"
                onClick={handleLogout}
                className="lg:hidden"
              />
            </Sidebar>
          )}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {isAuthenticated ? (
              <>
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/calendar" element={<CalendarEvents />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/homework" element={<Homework />} />
                <Route path="/homework/:id" element={<HomeworkDetail />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/problems" element={<Problems />} />

                {userRole !== UserRoles.Parent && (
                  <>
                    <Route path="/exams" element={<Home />} />
                    <Route path="/AboutExam" element={<ExamDetails />} />
                    <Route path="/SolveExam" element={<SolvingExam />} />
                    <Route path="/view-attempt/:attempt_id" element={<ReviewingExam />} />
                    {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                      <>
                        <Route path="/create-exam/*" element={<CreateExam />} />
                        <Route path="/update-exam/:examId/basic-information" element={<EditExamBasicInfo />} />
                        <Route path="/update-exam/:examId/edit-questions" element={<EditQuestions />} />
                        <Route path="/update-exam/:examId/edit-participants" element={<EditParticipants />} />
                        <Route path="/update-exam/:examId/edit-settings" element={<EditExamDetailedInfo />} />
                        <Route path="/EvaluateExam" element={<EvaluateExam />} />
                        <Route path="/EvaluateAnswers" element={<EvaluateAnswers />} />
                        <Route path="/ViewResults" element={<Results />} />
                      </>
                    )}
                  </>
                )}

                {(userRole === UserRoles.Student || userRole === UserRoles.Parent) && (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/surveys" element={<Surveys />} />
                  </>
                )}
                {(userRole === UserRoles.Teacher || userRole === UserRoles.Administrator) && (
                  <>
                    <Route path="students" element={<Students />} />
                    <Route path="/students/:id" element={<StudentDetails />} />
                    <Route path="/classes" element={<Classes />} />
                    <Route path="/classes/:id" element={<ClassDetails />} />
                  </>
                )}
                {userRole === UserRoles.Administrator && (
                  <>
                    <Route path="/event-types" element={<EventTypes />} />
                    <Route path="/class-names" element={<ClassNames />} />
                    <Route path="/school-years" element={<SchoolYears />} />
                    <Route path="/school-years/:id" element={<SchoolYearsDetails />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/surveys" element={<Surveys />} />
                    <Route path="/surveys/:id" element={<SurveyDetails />} />
                  </>
                )}
              </>
            ) : (
              <Route path="*" element={<Login />} />
            )}
          </Routes>
        </div>
      </AuthContext.Provider>
    </SocketProvider>
  );
}
