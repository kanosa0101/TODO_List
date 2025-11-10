import React, { useState } from 'react';
import '../styles/components.css';

function TodoForm({ onSubmit }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit({ text, priority });
      setText('');
      setPriority('MEDIUM');
    }
  };

  return (
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
      <button type="submit" className="add-button">
        <span>➕</span> 添加
      </button>
    </form>
  );
}

export default TodoForm;

