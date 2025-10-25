import React, { JSX, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient.ts';
import {
  FaHome, FaCalendar, FaClock, FaClipboardList, FaBell, FaUser,
  FaSignOutAlt, FaBuilding, FaPenAlt, FaCalendarPlus, FaUsers, FaInbox
} from 'react-icons/fa';
import { BsFillSendPlusFill } from "react-icons/bs";
import '../styles/dashboardFaculty.css';

import Profile from '../components/Profile.tsx';
import ProctorExamDate from "./ProctorExamDate.tsx";
import ProctorSetAvailability from "./ProctorSetAvailability.tsx";
import ProctorViewExam from "./ProctorViewExam.tsx";
import Notification from "./Notification.tsx";
import BayanihanModality from "./BayanihanModality.tsx";
import SchedulerPlotSchedule from "./ScheduleViewer.tsx";
import SchedulerAvailability from "./SchedulerAvailability.tsx";
import DeanRequests from "./DeanRequests.tsx";
import Inbox from "./facultyInbox.tsx";
import RoomManagement from './RoomManagement.tsx';

const iconStyle = { className: 'icon', size: 20 };

const roleSidebarMap: Record<string, { key: string, label: string, icon: JSX.Element }[]> = {
  proctor: [
    { key: 'exam-Date', label: 'Exam Date', icon: <FaCalendar {...iconStyle} /> },
    { key: 'set-Availability', label: 'Set Availability', icon: <FaClock {...iconStyle} /> },
    { key: 'exam-Schedule', label: 'View Exam Schedule', icon: <FaClipboardList {...iconStyle} /> },
    { key: 'notification', label: 'Notification', icon: <FaBell {...iconStyle} /> },
    { key: 'inbox', label: 'Inbox', icon: <FaInbox {...iconStyle} /> },
  ],
  scheduler: [
    { key: 'exam-Date', label: 'Exam Date', icon: <FaCalendar {...iconStyle} /> },
    { key: 'plot-Schedule', label: 'Plot Schedule', icon: <FaCalendarPlus {...iconStyle} /> },
    { key: 'exam-Schedule', label: 'View Exam Schedule', icon: <FaClipboardList {...iconStyle} /> },
    { key: 'proctors-Availability', label: 'Available Proctor', icon: <FaUsers {...iconStyle} /> },
    { key: 'notification', label: 'Notification', icon: <FaBell {...iconStyle} /> },
    { key: 'inbox', label: 'Inbox', icon: <FaInbox {...iconStyle} /> },
    { key: 'Room-Management', label: 'Room Management', icon: <FaBuilding {...iconStyle} /> },
  ],
  dean: [
    { key: 'exam-Date', label: 'Exam Date', icon: <FaCalendar {...iconStyle} /> },
    { key: 'notification', label: 'Notification', icon: <FaBell {...iconStyle} /> },
    { key: 'Request', label: 'Requests', icon: <BsFillSendPlusFill {...iconStyle} /> },
    { key: 'inbox', label: 'Inbox', icon: <FaInbox {...iconStyle} /> },
  ],
  'bayanihan leader': [
    { key: 'exam-Date', label: 'Exam Date', icon: <FaCalendar {...iconStyle} /> },
    { key: 'set-Modality', label: 'Set Modality', icon: <FaPenAlt {...iconStyle} /> },
    { key: 'exam-Schedule', label: 'View Exam Schedule', icon: <FaClipboardList {...iconStyle} /> },
    { key: 'notification', label: 'Notification', icon: <FaBell {...iconStyle} /> },
    { key: 'inbox', label: 'Inbox', icon: <FaInbox {...iconStyle} /> },
  ]
};

const DashboardFaculty = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  /** 🧩 Load user info from API */
  useEffect(() => {
    const loadUser = async () => {
      // Get user from localStorage or sessionStorage
      const stored =
        JSON.parse(localStorage.getItem('user') || 'null') ||
        JSON.parse(sessionStorage.getItem('user') || 'null');

      if (!stored) return navigate('/');

      try {
        // Fetch full user info from backend
        const res = await api.get(`/users/${stored.user_id}/`);
        const data = res.data;

        // Merge data and create full name & default avatar
        setUser({
          ...data,
          full_name: `${data.first_name} ${data.middle_name ?? ''} ${data.last_name}`.trim(),
          avatar_url: data.avatar_url || '../../../backend/static/Images/default-pp.jpg',
        });
      } catch (err) {
        console.error('Error loading user info:', err);
        // Fallback to stored data if backend fails
        setUser({
          ...stored,
          full_name: `${stored.first_name} ${stored.middle_name ?? ''} ${stored.last_name}`.trim(),
          avatar_url: stored.avatar_url || '../../../backend/static/Images/default-pp.jpg',
        });
      }
    };

    loadUser();
  }, [navigate]);

  /** 🕒 Real-time clock */
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /** 🧩 Fetch user roles */
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.user_id) return;
      try {
        const res = await api.get(`/user-roles/${user.user_id}/roles/`);
        const roleData = res.data.map((r: any) => r.role_name.toLowerCase());
        setRoles(roleData);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };
    fetchUserRoles();
  }, [user]);

  /** 📩 Unread messages counter */
  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/inbox', {
          params: { receiver_id: user.user_id, is_read: false, is_deleted: false },
        });
        setUnreadCount(res.data.length);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  /** 🧭 Merge sidebar items */
  const mergedSidebarItems = Array.from(
    new Map(
      roles
        .flatMap(role => roleSidebarMap[role] || [])
        .map(item => {
          if (item.key === 'inbox') {
            return {
              ...item,
              label: unreadCount > 0
                ? <span style={{ color: '#F2994A' }}>{`${item.label} (${unreadCount})`}</span>
                : item.label,
            };
          }
          return item;
        })
        .map(item => [item.key, item])
    ).values()
  );

  const handleLogoutConfirm = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const timeString = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  const [hour, minute, ampm] = timeString.split(/:| /);
  const dateStr = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  if (!user) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <div className="main-content-wrapper">
        {roles.length > 0 && (
          <aside
            className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
            onMouseEnter={() => setIsSidebarOpen(true)}
            onMouseLeave={() => setIsSidebarOpen(false)}
          >
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <img src="../../../backend/static/logo/Exam.png" alt="Logo" className="logo-img" />
                {isSidebarOpen && <span className="logo-text">ExamSync</span>}
              </div>
            </div>

            <nav className="sidebar-nav">
              <ul>
                <li className={activeMenu === 'dashboard' ? 'active' : ''}>
                  <button type="button" onClick={() => setActiveMenu('dashboard')}>
                    <FaHome {...iconStyle} />
                    {isSidebarOpen && <span>Dashboard</span>}
                  </button>
                </li>

                {mergedSidebarItems.map(({ key, label, icon }) => (
                  <li key={key} className={activeMenu === key ? 'active' : ''}>
                    <button type="button" onClick={() => setActiveMenu(key)}>
                      {icon}
                      {isSidebarOpen && <span>{label}</span>}
                    </button>
                  </li>
                ))}

                <div className="sidebar-divider"></div>

                <li className={activeMenu === 'profile' ? 'active' : ''}>
                  <button type='button' onClick={() => setActiveMenu('profile')}>
                    <FaUser {...iconStyle} />
                    {isSidebarOpen && <span>Profile</span>}
                  </button>
                </li>

                <li>
                  <button type='button' onClick={() => setShowLogoutModal(true)}>
                    <FaSignOutAlt />
                    {isSidebarOpen && <span>Logout</span>}
                  </button>
                </li>
              </ul>
            </nav>

            {showLogoutModal && (
              <div className="myModal-overlay">
                <div className="myModal-box">
                  <h3 className="myModal-title">Are you sure you want to logout?</h3>
                  <div className="myModal-actions">
                    <button type='button' onClick={handleLogoutConfirm} className="myModal-btn myModal-btn-confirm">Logout</button>
                    <button type='button'  onClick={() => setShowLogoutModal(false)} className="myModal-btn myModal-btn-cancel">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        <main className={`main-content ${roles.length > 0 && isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="content-header">
            <h1>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1).replace(/-/g, ' ')}</h1>
          </div>

          {activeMenu === 'dashboard' && (
            <div className="dashboard-grid">
              <div className="card welcome-card">
                <h3>Welcome, <span className="robert-name">{user.first_name}!</span></h3>
                <p>Organize your work and improve your performance here</p>
              </div>

              <div className="card datetime-card">
                <div className="date-display-simple">{dateStr}</div>
                <div className="time-display">
                  <span>{hour}:</span><span>{minute}</span><span className="ampm">{ampm}</span>
                </div>
              </div>

              <div className="card faculty-info-card">
                <img src={user.avatar_url} alt="Avatar" className="faculty-avatar" />
                <h4>{user.full_name}</h4>
                <p>{roles.length ? roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ') : 'Loading roles...'}</p>
              </div>

              <div className="full-width-section">
                <h2>Shortcut</h2>
                <div className="try-things-grid">
                  <div className="try-thing-card"><ProctorExamDate /></div>
                  <div className="try-thing-card"><ProctorViewExam /></div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'exam-Date' && <ProctorExamDate />}
          {activeMenu === 'profile' && <Profile user={user} />}
          {activeMenu === 'set-Availability' && <ProctorSetAvailability user={user} />}
          {activeMenu === 'exam-Schedule' && <ProctorViewExam />}
          {activeMenu === 'notification' && <Notification />}
          {activeMenu === 'set-Modality' && <BayanihanModality user={user} />}
          {activeMenu === 'plot-Schedule' && <SchedulerPlotSchedule user={user}/>}
          {activeMenu === 'proctors-Availability' && <SchedulerAvailability user={user} />}
          {activeMenu === 'inbox' && <Inbox user={user} />}
          {activeMenu === 'Request' && <DeanRequests />}
          {activeMenu === 'Room-Management' && <RoomManagement user={user} />}
        </main>
      </div>
    </div>
  );
};

export default DashboardFaculty;
