import { useState, useEffect } from 'react';
import todoService from '../services/todoService';
import authService from '../services/authService';
import { FILTER } from '../utils/constants';
import TodoStats from './TodoStats';
import TodoForm from './TodoForm';
import TodoFilter from './TodoFilter';
import TodoList from './TodoList';
import UserMenu from './UserMenu';
import '../styles/App.css';

function TodoApp() {
  const [allTodos, setAllTodos] = useState([]); // 存储所有待办事项（用于统计）
  const [todos, setTodos] = useState([]); // 当前显示的待办事项（筛选后）
  const [filter, setFilter] = useState(FILTER.ACTIVE); // 默认显示进行中的任务
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 首次加载时获取全部数据
  useEffect(() => {
    fetchAllTodos();
  }, []);

  // 筛选改变时更新显示的数据
  useEffect(() => {
    applyFilter();
  }, [filter, allTodos]);

  const fetchAllTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoService.getAllTodos(null); // 获取全部数据
      // 确保数据格式正确，处理可能缺失的字段
      const normalizedData = Array.isArray(data) ? data.map(todo => ({
        ...todo,
        isDaily: todo.isDaily === true || todo.isDaily === 'true',
        durationUnit: todo.durationUnit || 'MINUTES',
        completedSteps: todo.completedSteps || 0,
        totalSteps: todo.totalSteps || null,
        estimatedDuration: todo.estimatedDuration || null
      })) : [];
      setAllTodos(normalizedData);
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401 || err.status === 403) {
        // Token过期或未授权，清除认证信息并跳转到登录页
        authService.logout();
        window.location.href = '/login';
      } else {
        const errorMsg = err.message || '加载待办事项失败';
        setError(`加载待办事项失败: ${errorMsg}`);
        console.error('加载待办事项失败:', err);
        // 如果是网络错误，显示更友好的提示
        if (err.message && err.message.includes('fetch')) {
          setError('无法连接到服务器，请检查网络连接或服务器是否运行');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === FILTER.ALL) {
      setTodos(allTodos);
    } else if (filter === FILTER.ACTIVE) {
      setTodos(allTodos.filter(t => !t.completed));
    } else if (filter === FILTER.COMPLETED) {
      setTodos(allTodos.filter(t => t.completed));
    }
  };

  const handleAdd = async (todoData) => {
    try {
      setError(null);
      await todoService.createTodo(todoData);
      setIsFormOpen(false); // 关闭弹窗
      // 重新获取所有数据以确保数据一致性
      await fetchAllTodos();
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        window.location.href = '/login';
      } else {
        setError('添加待办事项失败: ' + (err.message || '未知错误'));
        console.error('添加任务失败:', err);
      }
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      setError(null);
      const updatedTodo = await todoService.partialUpdateTodo(id, { completed: !completed });
      setAllTodos(allTodos.map(t => t.id === id ? updatedTodo : t)); // 更新全部数据
      // applyFilter 会自动更新显示的数据
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        window.location.href = '/login';
      } else {
        setError('更新待办事项失败');
        console.error(err);
      }
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      setError(null);
      const existingTodo = allTodos.find(t => t.id === id);
      const updatedTodo = await todoService.updateTodo(id, {
        ...existingTodo,
        ...updates,
      });
      setAllTodos(allTodos.map(t => t.id === id ? updatedTodo : t)); // 更新全部数据
      // applyFilter 会自动更新显示的数据
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        window.location.href = '/login';
      } else {
        setError('更新待办事项失败');
        console.error(err);
      }
    }
  };

  const handlePriorityChange = async (id, priority) => {
    try {
      setError(null);
      const updatedTodo = await todoService.partialUpdateTodo(id, { priority });
      setAllTodos(allTodos.map(t => t.id === id ? updatedTodo : t)); // 更新全部数据
      // applyFilter 会自动更新显示的数据
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        window.location.href = '/login';
      } else {
        setError('更新优先级失败');
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个待办事项吗？')) return;
    try {
      setError(null);
      await todoService.deleteTodo(id);
      setAllTodos(allTodos.filter(t => t.id !== id)); // 更新全部数据
      // applyFilter 会自动更新显示的数据
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        window.location.href = '/login';
      } else {
        setError('删除待办事项失败');
        console.error(err);
      }
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>
            <span className="icon">✨</span>
            <span>我的待办清单</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <TodoStats todos={allTodos} />
            <UserMenu />
          </div>
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <button 
            className="add-task-button" 
            onClick={() => setIsFormOpen(true)}
          >
            <span>➕</span> 添加新任务
          </button>
        </div>
        <TodoForm 
          onSubmit={handleAdd} 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
        <TodoFilter filter={filter} onFilterChange={setFilter} todos={allTodos} />

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>加载中...</span>
          </div>
        ) : (
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onPriorityChange={handlePriorityChange}
          />
        )}
      </div>
    </div>
  );
}

export default TodoApp;

