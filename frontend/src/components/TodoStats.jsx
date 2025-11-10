import React from 'react';
import '../styles/components.css';

function TodoStats({ todos }) {
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
  };

  return (
    <div className="stats">
      <div className="stat-item">
        <span className="stat-number">{stats.total}</span>
        <span className="stat-label">总计</span>
      </div>
      <div className="stat-item">
        <span className="stat-number active">{stats.active}</span>
        <span className="stat-label">进行中</span>
      </div>
      <div className="stat-item">
        <span className="stat-number completed">{stats.completed}</span>
        <span className="stat-label">已完成</span>
      </div>
    </div>
  );
}

export default TodoStats;

