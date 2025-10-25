import { useState, useEffect } from 'react';
import '../styles/proctorExamDate.css';
import React from 'react';
import { api } from '../lib/apiClient.ts';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

type ExamPeriod = {
  examperiod_id: number;
  start_date: string;
  end_date: string;
  academic_year: string;
  exam_category: string;

  term: number | null;
  term_id: number | null;
  term_name: string;

  department: string | null;
  department_id: string | null;
  department_name: string;

  college: string | null;
  college_id: string | null;
  college_name: string;
};

type Term = {
  term_id: number;
  term_name: string;
};

const ProctorExamDate = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [examPeriods, setExamPeriods] = useState<ExamPeriod[]>([]);
  const [termMap, setTermMap] = useState<Record<string, string>>({});
  const [isScheduler, setIsScheduler] = useState(false);
  const [schedulerCollege, setSchedulerCollege] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [filters, setFilters] = useState({
    academicYear: '',
    examCategory: '',
    collegeName: '',
    termId: '',
  });

  const today = new Date();
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Fetch scheduler role + college
  useEffect(() => {
    const fetchUserRoleAndCollege = async () => {
      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
        );
        if (!storedUser?.user_id) return;

        const realUserId = storedUser.user_id;

        // 1️⃣ Fetch all user roles
        const { data: roles } = await api.get(`/tbl_user_role`, {
          params: { user_id: realUserId }
        });
        console.log("User roles fetched:", roles);

        // 2️⃣ Find scheduler role (role_id = 3)
        const schedulerRole = roles.find((r: any) => r.role === 3 || r.role_id === 3);
        if (!schedulerRole) return;

        // 3️⃣ Scheduler detected
        setIsScheduler(true);

        // 4️⃣ Try to use college from user role
        let college = schedulerRole.college ?? schedulerRole.college_id ?? null;

        // 5️⃣ If still missing, fetch from tbl_users
        if (!college) {
          const { data: userData } = await api.get(`/tbl_users/${realUserId}`);
          college = userData?.college_id ?? null;
        }

        if (college) {
          setSchedulerCollege(college);
        } else {
          console.warn("Scheduler college not found in either role or user record");
        }

      } catch (err) {
        console.error("Error fetching role/college:", err);
      }
    };
    fetchUserRoleAndCollege();
  }, []);

  // Fetch exam periods + terms
  useEffect(() => {
    const fetchExamPeriods = async () => {
      try {
        const { data: examData } = await api.get<ExamPeriod[]>("/tbl_examperiod");
        if (examData) setExamPeriods(examData);

        const { data: termData } = await api.get<Term[]>("/tbl_term");
        if (termData) {
          const map: Record<string, string> = {};
          termData.forEach((t) => (map[t.term_id] = t.term_name));
          setTermMap(map);
        }
      } catch (err) {
        console.error("Error fetching exam periods or terms:", err);
      }
    };

    fetchExamPeriods();
    const intervalId = setInterval(fetchExamPeriods, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDayClick = async (date: Date) => {
    if (!isScheduler || !isEditMode) return;

    try {
      const formatDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

      // Find all exam periods for this date
      const existingPeriods = examPeriods.filter(
        (ep) => new Date(ep.start_date).toDateString() === date.toDateString()
      );

      console.log("Existing periods on this date:", existingPeriods);
      console.log("My scheduler college ID:", schedulerCollege);

      // Get unique assigned college IDs for this day (excluding nulls)
      const uniqueCollegeIds = Array.from(
        new Set(
          existingPeriods
            .map((ep) => ep.college_id)
            .filter((c) => c !== null && c !== undefined)
        )
      );

      console.log("Unique college IDs assigned:", uniqueCollegeIds);

      // Check if YOUR college is already assigned on this day
      const isMyCollegeAssigned = uniqueCollegeIds.includes(schedulerCollege!);

      console.log("Is my college assigned?", isMyCollegeAssigned);

      // If your college is already assigned, remove only your college
      if (isMyCollegeAssigned) {
        console.log("Removing my college ID:", schedulerCollege);

        const payload = {
          updates: [
            {
              start_date: formatDate(date),
              college_name: null,
              college_to_remove: schedulerCollege, // Use college_id to remove
            },
          ],
        };
        await api.put("/tbl_examperiod/bulk_update/", payload);
      } else {
        // Adding your college: enforce max 2 colleges per day
        const otherCollegesCount = uniqueCollegeIds.length;
        
        console.log("Other colleges count:", otherCollegesCount);

        if (otherCollegesCount >= 2) {
          alert("Cannot assign more than 2 colleges on the same day.");
          return;
        }

        // Pass the college_id to the backend
        const payload = {
          updates: [
            {
              start_date: formatDate(date),
              college_name: schedulerCollege, // Pass college_id
            },
          ],
        };
        
        console.log("Adding my college ID:", schedulerCollege);
        await api.put("/tbl_examperiod/bulk_update/", payload);
      }

      // Refresh data
      const { data: refreshed } = await api.get("/tbl_examperiod");
      if (refreshed) setExamPeriods(refreshed);

    } catch (err) {
      console.error("Error updating exam period:", err);
      alert("An error occurred. Check console for details.");
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    const updatedDate = new Date(currentMonth);
    updatedDate.setMonth(newMonth);
    setCurrentMonth(updatedDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const updatedDate = new Date(currentMonth);
    updatedDate.setFullYear(newYear);
    setCurrentMonth(updatedDate);
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonthIndex, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonthIndex, currentYear);

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonthIndex, day);

    const events = examPeriods.filter((ep) => {
      if (filters.academicYear && ep.academic_year !== filters.academicYear) return false;
      if (filters.examCategory && ep.exam_category !== filters.examCategory) return false;
      if (filters.collegeName && ep.college_name !== filters.collegeName) return false;
      if (filters.termId && String(ep.term_id) !== filters.termId) return false;

      const examDate = new Date(ep.start_date);
      return date.toDateString() === examDate.toDateString();
    });

    let cellClass = 'calendar-cell';
    if (isEditMode && isScheduler) cellClass += ' editable';
    
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    if (isToday) cellClass += ' today';

    calendarCells.push(
      <div
        key={`day-${day}`}
        className={cellClass}
        onClick={() => handleDayClick(date)}
        style={{ cursor: isEditMode && isScheduler ? 'pointer' : 'default' }}
      >
        <span className="day-number">{day}</span>
        {events.length > 0 && (
          <div className="event-details">
            {Array.from(new Set(events.map((e) => e.college_id || '')))
              .filter((college) => college)
              .map((college, idx) => (
                <div key={idx} className={`college-badge ${college.toLowerCase()}`}>
                  {college}
                </div>
              ))}
            <div className="semester">{termMap[String(events[0].term_id)] || "Unknown Term"}</div>
            <div className="semester">{events[0].academic_year}</div>
            <div className="exam">{events[0].exam_category}</div>
          </div>
        )}
      </div>
    );
  }

  const colleges = ['CSM', 'CITC', 'COT', 'CEA', 'CSTE', 'SHS'];
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const yearOptions = [];
  for (let y = 2020; y <= 2030; y++) yearOptions.push(y);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="left-date-label">
          <h2>
            {monthNames[currentMonthIndex]} {currentYear}
          </h2>
        </div>

        <div className="filters">
          <select className="dropdown" value={currentMonthIndex} onChange={handleMonthChange}>
            {monthNames.map((m, idx) => (
              <option key={idx} value={idx}>
                {m}
              </option>
            ))}
          </select>

          <select className="dropdown" value={currentYear} onChange={handleYearChange}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            className="dropdown"
            value={filters.termId}
            onChange={(e) => setFilters({ ...filters, termId: e.target.value })}
          >
            <option value="">All Semesters</option>
            {Object.entries(termMap).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <select
            className="dropdown"
            value={filters.examCategory}
            onChange={(e) => setFilters({ ...filters, examCategory: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="Preliminary">Preliminary</option>
            <option value="Midterm">Midterm</option>
            <option value="Prefinal">Prefinal</option>
            <option value="Final">Final</option>
          </select>

          {isScheduler ? (
            <span className="scheduler-college-label">
              College: <strong>{schedulerCollege}</strong>
            </span>
          ) : (
            <select
              className="dropdown"
              value={filters.collegeName}
              onChange={(e) => setFilters({ ...filters, collegeName: e.target.value })}
            >
              <option value="">All Colleges</option>
              {colleges.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          )}
          
          {isScheduler && (
            <div className="save-section">
              <button 
                type="button" 
                className={`now-button ${isEditMode ? 'active' : ''}`}
                onClick={handleEditToggle}
              >
                {isEditMode ? 'Done Editing' : 'Edit'}
              </button>
            </div>
          )}

          <button type="button" className="now-button" onClick={goToToday}>
            Now
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, idx) => (
          <div key={idx} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">{calendarCells}</div>

      <div className="bottom-navigation">
        <button type="button" className="nav-arrow" onClick={goToPreviousMonth}>
          <FaChevronLeft />
        </button>
        <button type="button" className="nav-arrow" onClick={goToNextMonth}>
          <FaChevronRight />
        </button>
      </div>

      <div className="legend">
        {colleges.map((college, index) => (
          <div key={index} className={`legend-item ${college.toLowerCase()}`}>
            <div className="legend-colored-box-with-text">{college}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProctorExamDate;
