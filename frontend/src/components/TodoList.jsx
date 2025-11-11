import React from 'react';
import TodoItem from './TodoItem';
import '../styles/components.css';

function TodoList({ todos, onToggle, onUpdate, onDelete, onPriorityChange }) {
  // 分类任务，处理可能为null/undefined的isDaily字段
  const dailyTodos = todos.filter(t => t.isDaily === true);
  const otherTodos = todos.filter(t => !t.isDaily || t.isDaily === false);
  
  const dailyActive = dailyTodos.filter(t => !t.completed);
  const dailyCompleted = dailyTodos.filter(t => t.completed);
  const otherActive = otherTodos.filter(t => !t.completed);
  const otherCompleted = otherTodos.filter(t => t.completed);

  const renderTodoSection = (title, todoList, sectionClass) => {
    if (todoList.length === 0) return null;
    
    return (
      <div className={`todo-section ${sectionClass}`}>
        <div className="section-header">
          <h3 className="section-title">{title}</h3>
          <span className="section-count">{todoList.length}</span>
        </div>
        <div className="todo-list">
          {todoList.map(todo => (
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
      </div>
    );
  };

  // 检查是否有任何任务
  const hasAnyTasks = dailyActive.length > 0 || dailyCompleted.length > 0 || 
                      otherActive.length > 0 || otherCompleted.length > 0;

  if (!hasAnyTasks) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <p>暂无待办事项</p>
        <p className="empty-hint">添加一个新任务开始吧！</p>
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      {/* 每日任务块 */}
      {(dailyActive.length > 0 || dailyCompleted.length > 0) && (
        <div className="todo-block daily-block">
          <div className="block-header">
            <span className="block-icon">🔄</span>
            <span className="block-title">每日任务</span>
          </div>
          {renderTodoSection('进行中', dailyActive, 'daily-active')}
          {renderTodoSection('已完成', dailyCompleted, 'daily-completed')}
        </div>
      )}

      {/* 其他任务块 */}
      {(otherActive.length > 0 || otherCompleted.length > 0) && (
        <div className="todo-block other-block">
          <div className="block-header">
            <span className="block-icon">📋</span>
            <span className="block-title">其他任务</span>
          </div>
          {renderTodoSection('进行中', otherActive, 'other-active')}
          {renderTodoSection('已完成', otherCompleted, 'other-completed')}
        </div>
      )}
    </div>
  );
}

export default TodoList;

