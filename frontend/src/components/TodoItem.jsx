import React, { useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../utils/constants';
import '../styles/components.css';

function TodoItem({ todo, onToggle, onUpdate, onDelete, onPriorityChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority?.toLowerCase()}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id, todo.completed)}
          className="todo-checkbox"
        />
        <div className="todo-main">
          {isEditing ? (
            <div className="edit-section">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="edit-input"
                autoFocus
              />
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn">✓</button>
                <button onClick={handleCancel} className="cancel-btn">✕</button>
              </div>
            </div>
          ) : (
            <>
              <span className="todo-text">{todo.text}</span>
              <div className="todo-meta">
                <span
                  className="priority-badge"
                  style={{ backgroundColor: PRIORITY_COLORS[todo.priority] }}
                >
                  {PRIORITY_LABELS[todo.priority]}
                </span>
                {todo.createdAt && (
                  <span className="todo-date">{formatDate(todo.createdAt)}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {!isEditing && (
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
          <button onClick={() => setIsEditing(true)} className="edit-button" title="编辑">
            ✏️
          </button>
          <button onClick={() => onDelete(todo.id)} className="delete-button" title="删除">
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

export default TodoItem;

