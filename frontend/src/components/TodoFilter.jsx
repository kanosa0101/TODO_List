import React from 'react';
import { FILTER } from '../utils/constants';
import '../styles/components.css';

function TodoFilter({ filter, onFilterChange, todos }) {
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  return (
    <div className="filter-section">
      <button
        className={`filter-btn ${filter === FILTER.ALL ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER.ALL)}
      >
        全部 ({stats.total})
      </button>
      <button
        className={`filter-btn ${filter === FILTER.ACTIVE ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER.ACTIVE)}
      >
        进行中 ({stats.active})
      </button>
      <button
        className={`filter-btn ${filter === FILTER.COMPLETED ? 'active' : ''}`}
        onClick={() => onFilterChange(FILTER.COMPLETED)}
      >
        已完成 ({stats.completed})
      </button>
    </div>
  );
}

export default TodoFilter;

