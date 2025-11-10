import React from 'react';
import TodoItem from './TodoItem';
import '../styles/components.css';

function TodoList({ todos, onToggle, onUpdate, onDelete, onPriorityChange }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <p>暂无待办事项</p>
        <p className="empty-hint">添加一个新任务开始吧！</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onPriorityChange={onPriorityChange}
        />
      ))}
    </div>
  );
}

export default TodoList;

