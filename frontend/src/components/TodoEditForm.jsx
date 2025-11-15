import React, { useState, useEffect } from 'react';
import '../styles/components.css';

function TodoEditForm({ todo, onSubmit, onCancel }) {
  const [text, setText] = useState(todo.text || '');
  const [priority, setPriority] = useState(todo.priority || 'MEDIUM');
  const [totalSteps, setTotalSteps] = useState(todo.totalSteps ? todo.totalSteps.toString() : '');
  const [completedSteps, setCompletedSteps] = useState(todo.completedSteps ? todo.completedSteps.toString() : '0');
  const [estimatedDuration, setEstimatedDuration] = useState(todo.estimatedDuration ? todo.estimatedDuration.toString() : '');
  const [durationUnit, setDurationUnit] = useState(todo.durationUnit || 'MINUTES');
  const [isDaily, setIsDaily] = useState(todo.isDaily === true);
  const [deadline, setDeadline] = useState(() => {
    // 优先使用deadline，如果没有则使用dueDate
    const dateValue = todo.deadline || todo.dueDate;
    if (!dateValue) return '';
    // 将ISO格式转换为datetime-local格式
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  // 当isDaily改变时，清除截止时间
  useEffect(() => {
    if (isDaily) {
      setDeadline('');
    }
  }, [isDaily]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }

    const updates = {
      text: text.trim(),
      priority: priority || 'MEDIUM',
      isDaily: isDaily,
    };

    // 处理步骤数
    if (totalSteps) {
      const total = parseInt(totalSteps);
      const completed = parseInt(completedSteps) || 0;
      updates.totalSteps = total;
      updates.completedSteps = Math.min(completed, total); // 确保已完成步骤不超过总步骤
    } else {
      updates.totalSteps = null;
      updates.completedSteps = null;
    }

    // 处理预计时长
    if (estimatedDuration) {
      updates.estimatedDuration = parseInt(estimatedDuration);
      updates.durationUnit = durationUnit || 'MINUTES';
    } else {
      updates.estimatedDuration = null;
      updates.durationUnit = null;
    }

    // 处理截止时间
    if (isDaily) {
      // 每日任务清除截止时间
      updates.deadline = null;
      updates.dueDate = null;
    } else if (deadline) {
      // 非每日任务，设置截止时间
      // datetime-local格式转换为ISO格式（添加秒和时区）
      const deadlineISO = deadline + ':00'; // 添加秒
      updates.deadline = deadlineISO;
      updates.dueDate = deadlineISO; // 向后兼容
    } else {
      // 如果没有设置截止时间，清除
      updates.deadline = null;
      updates.dueDate = null;
    }

    onSubmit(updates);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>编辑任务</h2>
          <button type="button" className="modal-close" onClick={onCancel}>×</button>
        </div>
        <form className="todo-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="任务内容"
              className="todo-input"
              required
              autoFocus
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
              <label htmlFor="edit-totalSteps">总步骤数（可选）</label>
              <input
                type="number"
                id="edit-totalSteps"
                value={totalSteps}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setTotalSteps(value);
                  }
                }}
                placeholder="例如：10"
                min="1"
                className="form-number-input"
              />
            </div>

            {totalSteps && (
              <div className="form-field-group">
                <label htmlFor="edit-completedSteps">已完成步骤</label>
                <input
                  type="number"
                  id="edit-completedSteps"
                  value={completedSteps}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      const num = value === '' ? 0 : parseInt(value);
                      const max = totalSteps ? parseInt(totalSteps) : 0;
                      setCompletedSteps(Math.min(num, max).toString());
                    }
                  }}
                  placeholder="例如：5"
                  min="0"
                  max={totalSteps || undefined}
                  className="form-number-input"
                />
              </div>
            )}

            <div className="form-field-group">
              <label htmlFor="edit-estimatedDuration">预计时长（可选）</label>
              <input
                type="number"
                id="edit-estimatedDuration"
                value={estimatedDuration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setEstimatedDuration(value);
                  }
                }}
                placeholder="例如：60"
                min="1"
                className="form-number-input"
              />
            </div>

            {estimatedDuration && (
              <div className="form-field-group">
                <label htmlFor="edit-durationUnit">时长单位</label>
                <select
                  id="edit-durationUnit"
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  className="form-number-input"
                >
                  <option value="MINUTES">分钟</option>
                  <option value="HOURS">小时</option>
                  <option value="DAYS">天</option>
                </select>
              </div>
            )}

            <div className="form-field-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isDaily}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsDaily(checked);
                    if (checked) {
                      setDeadline('');
                    }
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>每日任务（每天自动刷新）</span>
              </label>
            </div>

            <div className="form-field-group">
              <label htmlFor="edit-deadline">截止时间（非每日任务可选）</label>
              <input
                type="datetime-local"
                id="edit-deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isDaily}
                className="form-number-input"
              />
              {isDaily && (
                <span className="field-helper-text">每日任务不支持截止时间</span>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="add-button">
              <span>💾</span> 保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TodoEditForm;

