import React, { useState } from 'react';
import '../styles/components.css';

function TodoForm({ onSubmit, isOpen, onClose }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [totalSteps, setTotalSteps] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('MINUTES');
  const [isDaily, setIsDaily] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      const todoData = { 
        text, 
        priority: priority || 'MEDIUM',
      };
      
      if (totalSteps) {
        todoData.totalSteps = parseInt(totalSteps);
      }
      
      if (estimatedDuration) {
        todoData.estimatedDuration = parseInt(estimatedDuration);
        todoData.durationUnit = durationUnit || 'MINUTES';
      }
      
      if (isDaily) {
        todoData.isDaily = true;
      }
      
      onSubmit(todoData);
      setText('');
      setPriority('MEDIUM');
      setTotalSteps('');
      setEstimatedDuration('');
      setDurationUnit('MINUTES');
      setIsDaily(false);
      onClose();
    }
  };

  const handleCancel = () => {
    setText('');
    setPriority('MEDIUM');
    setTotalSteps('');
    setEstimatedDuration('');
    setDurationUnit('MINUTES');
    setIsDaily(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>添加新任务</h2>
          <button type="button" className="modal-close" onClick={handleCancel}>×</button>
        </div>
        <form className="todo-form" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入新的待办事项..."
          className="todo-input"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          <option value="LOW">低优先级</option>
          <option value="MEDIUM">中优先级</option>
          <option value="HIGH">高优先级</option>
        </select>
      </div>
      <div className="form-extra-fields">
        <div className="form-field-group">
          <label htmlFor="totalSteps">总步骤数（可选）</label>
          <input
            type="number"
            id="totalSteps"
            value={totalSteps}
            onChange={(e) => {
              const value = e.target.value;
              // 允许空字符串和数字
              if (value === '' || /^\d+$/.test(value)) {
                setTotalSteps(value);
              }
            }}
            onKeyDown={(e) => {
              // 允许退格、删除、Tab等控制键
              if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
                  e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                  e.ctrlKey || e.metaKey) {
                return;
              }
              // 只允许数字
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="例如：10"
            min="1"
            className="form-number-input"
          />
        </div>
        <div className="form-field-group">
          <label htmlFor="estimatedDuration">预计时长（可选）</label>
          <input
            type="number"
            id="estimatedDuration"
            value={estimatedDuration}
            onChange={(e) => {
              const value = e.target.value;
              // 允许空字符串和数字
              if (value === '' || /^\d+$/.test(value)) {
                setEstimatedDuration(value);
              }
            }}
            onKeyDown={(e) => {
              // 允许退格、删除、Tab等控制键
              if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
                  e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                  e.ctrlKey || e.metaKey) {
                return;
              }
              // 只允许数字
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="例如：60"
            min="1"
            className="form-number-input"
          />
        </div>
        <div className="form-field-group">
          <label htmlFor="durationUnit">时长单位（可选）</label>
          <select
            id="durationUnit"
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value)}
            className="form-number-input"
          >
            <option value="MINUTES">分钟</option>
            <option value="HOURS">小时</option>
            <option value="DAYS">天</option>
          </select>
        </div>
        <div className="form-field-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isDaily}
              onChange={(e) => setIsDaily(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>每日任务（每天自动刷新）</span>
          </label>
        </div>
      </div>
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              取消
            </button>
            <button type="submit" className="add-button">
              <span>➕</span> 添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TodoForm;

