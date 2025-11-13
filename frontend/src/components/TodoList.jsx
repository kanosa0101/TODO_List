import React from 'react';
import TodoItem from './TodoItem';
import '../styles/components.css';

function TodoList({ todos, onToggle, onUpdate, onDelete, onPriorityChange }) {
  // 排序函数：非每日任务按截止时间升序，每日任务置底
  const sortTodos = (todoList) => {
    return [...todoList].sort((a, b) => {
      const aIsDaily = a.isDaily === true;
      const bIsDaily = b.isDaily === true;
      
      // 每日任务置底
      if (aIsDaily && !bIsDaily) return 1;
      if (!aIsDaily && bIsDaily) return -1;
      
      // 如果都是每日任务或都不是每日任务
      if (aIsDaily && bIsDaily) {
        // 每日任务按创建时间排序
        const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aCreated - bCreated;
      }
      
      // 非每日任务按截止时间升序
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      
      if (aDue !== bDue) {
        return aDue - bDue;
      }
      
      // 截止时间相同则按创建时间先后
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aCreated - bCreated;
    });
  };

  // 分类任务，处理可能为null/undefined的isDaily字段
  const dailyTodos = todos.filter(t => t.isDaily === true);
  const otherTodos = todos.filter(t => !t.isDaily || t.isDaily === false);
  
  // 对非每日任务进行排序
  const sortedOtherTodos = sortTodos(otherTodos);
  const sortedDailyTodos = sortTodos(dailyTodos);
  
  const dailyActive = sortedDailyTodos.filter(t => !t.completed);
  const dailyCompleted = sortedDailyTodos.filter(t => t.completed);
  const otherActive = sortedOtherTodos.filter(t => !t.completed);
  const otherCompleted = sortedOtherTodos.filter(t => t.completed);

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

