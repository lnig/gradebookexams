import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, Bell, User, ChevronDown, Search, LogOut, Settings } from 'lucide-react';
import { getToken } from '../utils/UserRoleUtils';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ 
  messNot, 
  messNotNumber, 
  bellNot, 
  bellNotNumber, 
  onLogout, 
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(bellNotNumber || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = getToken();
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/notifications/getNotifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch notifications.');
      }

      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const markAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadNotifications.length === 0) return;
    console.log(notifications)

    try {
      const response = await fetch('http://localhost:3000/notifications/markAsRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notification_ids: unreadNotifications }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to mark notifications as read.');
      }

      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          unreadNotifications.includes(n.id) ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, [notifications, token]);

  const toggleNotifications = async () => {
    const willOpen = !isNotificationsOpen;
    setIsNotificationsOpen(willOpen);
    if (willOpen) {
      await fetchNotifications();
      await markAsRead();
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleOnClick = (examId) => {
    navigate(`/AboutExam?exam_id=${examId}`);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current && 
        !notificationsRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="hidden lg:flex justify-end py-3 px-8 gap-8 items-center w-full pt whitespace-nowrap bg-textBg-100">
      <div className="h-9 flex items-center px-3 py-3 bg-white rounded border border-solid border-neutral-400 text-textBg-700">
        <Search size={16} className="mr-2 text-textBg-700" />
        <input type="text" placeholder="Search" className="w-96 focus:outline-none text-sm" />
      </div>

      <div className="relative">
        {bellNot && (
          <div className="absolute h-4 w-4 rounded-full bg-red-500 -right-1 -top-1 flex items-center justify-center">
            <p className="text-[8px] text-textBg-100">{unreadCount > 9 ? '9+' : unreadCount}</p>
          </div>
        )}
        <Bell
          ref={bellRef}
          size={24}
          className="text-textBg-700 hover:cursor-pointer"
          onClick={toggleNotifications}
        />

        {isNotificationsOpen && (
          <div
            ref={notificationsRef} 
            className="absolute right-0 mt-2 w-80 bg-white border border-textBg-300 rounded shadow-2xl z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-textBg-700">Notifications</h3>
              {isLoading && <p className="text-sm text-textBg-500">Loading...</p>}
              <ul className="mt-2 max-h-64 overflow-y-auto">
                {!isLoading && !error && (
                  notifications.length === 0 ? (
                    <li className="text-sm text-textBg-300">No notifications.</li>
                  ) : (
                    notifications.map(notification => (
                      <li
                        key={notification.id}
                        className={`flex items-start p-2 rounded hover:bg-gray-100 hover:cursor-pointer ${
                          !notification.is_read ? 'bg-textBg-100' : ''
                        }`}
                      >
                        <div className="flex-1" onClick={() => handleOnClick(notification.exam_id)}>
                        
                          <p className="text-sm text-textBg-700">{notification.description}</p>
                          <p className="text-xs text-textBg-500">
                            {new Date(notification.notification_date).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))
                  )
                )}
                {!isLoading && error && (
                  <li className="text-sm text-red-500">Error: {error}</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex flex-row items-center hover:cursor-pointer" onClick={toggleDropdown}>
          <div className="bg-primary-500 w-9 h-9 rounded-full flex items-center justify-center">
            <User size={18} className="text-textBg-100" />
          </div>
          <ChevronDown size={24} className="text-textBg-700 ml-4" />
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-textBg-300 rounded shadow-2xl z-50 transition">
            <button
              onClick={onLogout}
              className="block w-full text-left px-4 py-2 text-sm text-textBg-700 hover:bg-gray-100"
            >
              <LogOut size={18} className="inline-block mr-2" />
              Logout
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm text-textBg-700 hover:bg-gray-100">
              <Settings size={18} className="inline-block mr-2" />
              Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
