import React, { useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../utils/constants';
import TodoEditForm from './TodoEditForm';
import '../styles/components.css';

function TodoItem({ todo, onToggle, onUpdate, onDelete, onPriorityChange }) {
  const [showEditForm, setShowEditForm] = useState(false);

  const dueDateText = formatDate(todo.dueDate);

  const isOverdue = () => {
    if (!todo.dueDate || todo.completed) return false;
    const now = new Date();
    const due = new Date(todo.dueDate);
    return due.getTime() < now.getTime();
  };

  const isDueSoon = (overdueFlag) => {
    if (!todo.dueDate || todo.completed || overdueFlag) return false;
    const now = new Date();
    const due = new Date(todo.dueDate);
    const diff = due.getTime() - now.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    return diff >= 0 && diff <= oneDayMs;
  };

  const overdue = isOverdue();
  const dueSoon = isDueSoon(overdue);

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleEditSubmit = (updates) => {
    onUpdate(todo.id, updates);
    setShowEditForm(false);
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  const handleProgressChange = (delta) => {
    if (!todo.totalSteps) return;
    const newCompletedSteps = Math.max(0, Math.min(todo.totalSteps, (todo.completedSteps || 0) + delta));
    onUpdate(todo.id, { completedSteps: newCompletedSteps });
  };

  const getProgressPercentage = () => {
    if (!todo.totalSteps || todo.totalSteps === 0) return 0;
    return Math.round(((todo.completedSteps || 0) / todo.totalSteps) * 100);
  };

  const formatDuration = (duration, unit) => {
    if (!duration) return null;
    if (!unit) unit = 'MINUTES'; // 兼容旧数据
    
    switch (unit) {
      case 'DAYS':
        return `${duration}天`;
      case 'HOURS':
        return `${duration}小时`;
      case 'MINUTES':
      default:
        return `${duration}分钟`;
    }
  };

  return (
    <>
      {showEditForm && (
        <TodoEditForm
          todo={todo}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      )}
      <div className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority?.toLowerCase()}`}>
        <div className="todo-content">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id, todo.completed)}
            className="todo-checkbox"
          />
          <div className="todo-main">
            <span className="todo-text">{todo.text}</span>
              <div className="todo-meta">
                <span
                  className="priority-badge"
                  style={{ backgroundColor: PRIORITY_COLORS[todo.priority] }}
                >
                  {PRIORITY_LABELS[todo.priority]}
                </span>
                {dueDateText && (
                  <span
                    className={[
                      'todo-due-date',
                      !todo.completed && overdue ? 'due-overdue' : null,
                      !todo.completed && dueSoon ? 'due-soon' : null
                    ].filter(Boolean).join(' ')}
                  >
                    📅 截止 {dueDateText}
                  </span>
                )}
                {todo.estimatedDuration && (
                  <span className="todo-duration">⏱️ {formatDuration(todo.estimatedDuration, todo.durationUnit || 'MINUTES')}</span>
                )}
                {todo.isDaily === true && (
                  <span className="daily-badge">🔄 每日</span>
                )}
              </div>
              {todo.totalSteps && todo.totalSteps > 0 && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">
                      进度: {todo.completedSteps || 0} / {todo.totalSteps}
                    </span>
                    <span className="progress-percentage">{getProgressPercentage()}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="progress-controls">
                    <button 
                      onClick={() => handleProgressChange(-1)} 
                      className="progress-btn"
                      disabled={(todo.completedSteps || 0) <= 0}
                    >
                      ➖
                    </button>
                    <button 
                      onClick={() => handleProgressChange(1)} 
                      className="progress-btn"
                      disabled={(todo.completedSteps || 0) >= todo.totalSteps}
                    >
                      ➕
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
        <div className="todo-actions">
          <select
            value={todo.priority}
            onChange={(e) => onPriorityChange(todo.id, e.target.value)}
            className="priority-dropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="LOW">低</option>
            <option value="MEDIUM">中</option>
            <option value="HIGH">高</option>
          </select>
          <button onClick={handleEditClick} className="edit-button" title="编辑">
            ✏️
          </button>
          <button onClick={() => onDelete(todo.id)} className="delete-button" title="删除">
            🗑️
          </button>
        </div>
      </div>
    </>
  );
}

export default TodoItem;

