import { useState, useEffect } from 'react';
import '../styles/components.css';

function Calendar({ todos = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // 获取有任务的日期
  const getDatesWithTasks = () => {
    const dates = new Set();
    todos.forEach(todo => {
      if (todo.dueDate) {
        const date = new Date(todo.dueDate);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dates.add(dateStr);
      }
    });
    return dates;
  };

  const datesWithTasks = getDatesWithTasks();

  // 获取月份的第一天和最后一天
  const getMonthInfo = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // 转换为周一到周日 (0=周一, 6=周日)
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // 0=周日 -> 6, 1=周一 -> 0, etc.
    
    return { year, month, daysInMonth, startingDayOfWeek };
  };

  // 获取上个月的最后几天
  const getPreviousMonthDays = (year, month, startingDayOfWeek) => {
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    const days = [];
    
    // startingDayOfWeek 已经是周一到周日的格式 (0=周一, 6=周日)
    // 需要显示上个月的几天来填充第一周
    if (startingDayOfWeek > 0) {
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: daysInPrevMonth - i,
          isCurrentMonth: false,
          date: new Date(year, month - 1, daysInPrevMonth - i)
        });
      }
    }
    return days;
  };

  // 获取下个月的前几天
  const getNextMonthDays = (totalCells, currentDays) => {
    const days = [];
    const remaining = totalCells - currentDays.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentDate.getMonth() + 1;
      const nextYear = currentDate.getFullYear();
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(nextYear, nextMonth, i)
      });
    }
    return days;
  };

  // 生成日历天数数组
  const generateCalendarDays = () => {
    const { year, month, daysInMonth, startingDayOfWeek } = getMonthInfo(currentDate);
    const days = [];

    // 上个月的日期
    const prevDays = getPreviousMonthDays(year, month, startingDayOfWeek);
    days.push(...prevDays);

    // 当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }

    // 下个月的日期（填充到42个格子）
    const totalCells = 42; // 6行 × 7列
    const nextDays = getNextMonthDays(totalCells, days);
    days.push(...nextDays);

    return days;
  };

  const calendarDays = generateCalendarDays();

  // 检查是否是今天
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 检查是否是周末（周六或周日）
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0=周日, 6=周六
  };

  // 检查日期是否有任务
  const hasTask = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return datesWithTasks.has(dateStr);
  };

  // 格式化月份标题
  const formatMonthTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year} 年 ${month} 月`;
  };

  // 切换到上一个月
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 切换到下一个月
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 处理日期点击
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={goToPreviousMonth}>‹</button>
        <h3 className="calendar-month-title">{formatMonthTitle()}</h3>
        <button className="calendar-nav-btn" onClick={goToNextMonth}>›</button>
      </div>
      <div className="calendar-weekdays">
        <div className="weekday">一</div>
        <div className="weekday">二</div>
        <div className="weekday">三</div>
        <div className="weekday">四</div>
        <div className="weekday">五</div>
        <div className="weekday">六</div>
        <div className="weekday">日</div>
      </div>
      <div className="calendar-grid">
        {calendarDays.map((dayInfo, index) => {
          const { day, isCurrentMonth, date } = dayInfo;
          const today = isToday(date);
          const weekend = isWeekend(date);
          const hasTaskOnDate = hasTask(date);
          const isSelected = selectedDate && 
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${weekend ? 'weekend' : ''} ${today ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <span className="day-number">{day}</span>
              {hasTaskOnDate && <span className="task-dot"></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;

