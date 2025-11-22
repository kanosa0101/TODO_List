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
      <div className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority?.toLowerCase()}`}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '4px solid var(--border-color)',
          borderRadius: '8px',
          marginBottom: '1rem',
          padding: '1rem',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="todo-content" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id, todo.completed)}
            className="todo-checkbox"
            style={{ marginTop: '0.3rem', accentColor: 'var(--accent-primary)' }}
          />
          <div className="todo-main" style={{ flex: 1 }}>
            <span className="todo-text" style={{
              fontSize: '1.1rem',
              color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: todo.completed ? 'line-through' : 'none',
              display: 'block',
              marginBottom: '0.5rem'
            }}>{todo.text}</span>
            <div className="todo-meta" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span
                className="priority-badge"
                style={{
                  backgroundColor: PRIORITY_COLORS[todo.priority],
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}
              >
                {PRIORITY_LABELS[todo.priority]}
              </span>
              {dueDateText && (
                <span
                  style={{ color: 'var(--text-secondary)' }}
                  className={[
                    'todo-due-date',
                    !todo.completed && overdue ? 'due-overdue' : null,
                    !todo.completed && dueSoon ? 'due-soon' : null
                  ].filter(Boolean).join(' ')}
                >
                  📅 {dueDateText}
                </span>
              )}
              {todo.estimatedDuration && (
                <span className="todo-duration" style={{ color: 'var(--text-secondary)' }}>⏱️ {formatDuration(todo.estimatedDuration, todo.durationUnit || 'MINUTES')}</span>
              )}
              {todo.isDaily === true && (
                <span className="daily-badge" style={{ color: 'var(--accent-secondary)' }}>🔄 Daily</span>
              )}
            </div>
            {todo.totalSteps && todo.totalSteps > 0 && (
              <div className="progress-section">
                <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                  <span className="progress-label">
                    Progress: {todo.completedSteps || 0} / {todo.totalSteps}
                  </span>
                  <span className="progress-percentage">{getProgressPercentage()}%</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${getProgressPercentage()}%`
                    }}
                  ></div>
                </div>
                <div className="progress-controls" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleProgressChange(-1)}
                    className="progress-btn"
                    disabled={(todo.completedSteps || 0) <= 0}
                    style={{ padding: '0.2rem 0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ➖
                  </button>
                  <button
                    onClick={() => handleProgressChange(1)}
                    className="progress-btn"
                    disabled={(todo.completedSteps || 0) >= todo.totalSteps}
                    style={{ padding: '0.2rem 0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ➕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="todo-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
          <select
            value={todo.priority}
            onChange={(e) => onPriorityChange(todo.id, e.target.value)}
            className="priority-dropdown"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem' }}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <button onClick={handleEditClick} className="edit-button" title="Edit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
            ✏️
          </button>
          <button onClick={() => onDelete(todo.id)} className="delete-button" title="Delete" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
            🗑️
          </button>
        </div>
      </div>
    </>
  );
}

export default TodoItem;

