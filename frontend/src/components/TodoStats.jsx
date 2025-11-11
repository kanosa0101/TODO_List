import React from 'react';
import '../styles/components.css';

function TodoStats({ todos }) {
  // 排除每日任务，处理可能为null/undefined的isDaily字段
  const otherTodos = todos.filter(t => !t.isDaily || t.isDaily === false);
  const stats = {
    total: otherTodos.length,
    completed: otherTodos.filter(t => t.completed).length,
    active: otherTodos.filter(t => !t.completed).length,
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

