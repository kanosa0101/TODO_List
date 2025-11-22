import { useState, useEffect } from 'react';
import todoService from '../services/todoService';
import authService from '../services/authService';
import { FILTER } from '../utils/constants';
import TodoStats from './TodoStats';
import TodoForm from './TodoForm';
import TodoFilter from './TodoFilter';
import TodoList from './TodoList';
import UserMenu from './UserMenu';
import CurrentTime from './CurrentTime';
import Calendar from './Calendar';
import Navigation from './Navigation';
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
        estimatedDuration: todo.estimatedDuration || null,
        dueDate: todo.dueDate || null
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
      if (!existingTodo) {
        setError('找不到要更新的任务');
        return;
      }

      // 构建完整的更新对象，确保所有字段都正确传递
      const updateData = {
        text: updates.text !== undefined ? updates.text : existingTodo.text,
        priority: updates.priority !== undefined ? updates.priority : existingTodo.priority,
        completed: updates.completed !== undefined ? updates.completed : existingTodo.completed,
        isDaily: updates.isDaily !== undefined ? updates.isDaily : existingTodo.isDaily,
        totalSteps: updates.totalSteps !== undefined ? updates.totalSteps : existingTodo.totalSteps,
        completedSteps: updates.completedSteps !== undefined ? updates.completedSteps : existingTodo.completedSteps,
        estimatedDuration: updates.estimatedDuration !== undefined ? updates.estimatedDuration : existingTodo.estimatedDuration,
        durationUnit: updates.durationUnit !== undefined ? updates.durationUnit : existingTodo.durationUnit,
        deadline: updates.deadline !== undefined ? updates.deadline : existingTodo.deadline,
        dueDate: updates.dueDate !== undefined ? updates.dueDate : existingTodo.dueDate,
      };

      // 如果变成每日任务，确保清除截止时间
      if (updateData.isDaily) {
        updateData.deadline = null;
        updateData.dueDate = null;
      }

      const updatedTodo = await todoService.updateTodo(id, updateData);
      setAllTodos(allTodos.map(t => t.id === id ? updatedTodo : t)); // 更新全部数据
      // applyFilter 会自动更新显示的数据
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        window.location.href = '/login';
      } else {
        setError('更新待办事项失败: ' + (err.message || '未知错误'));
        console.error('更新任务失败:', err);
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
        <UserMenu />
        <Navigation />
        <div className="card" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div className="header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <span className="icon">⚡</span>
              <span>Task Command Center</span>
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <CurrentTime />
              <Calendar todos={allTodos} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => setIsFormOpen(true)}
              style={{ width: '100%', maxWidth: '300px' }}
            >
              <span>➕</span> Initialize New Task
            </button>
          </div>
          <TodoForm
            onSubmit={handleAdd}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
          />
          <TodoFilter filter={filter} onFilterChange={setFilter} todos={allTodos} />

          {error && <div className="error-message" style={{ color: '#ff4d4f', marginBottom: '1rem' }}>{error}</div>}

          {loading ? (
            <div className="loading" style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-primary)' }}>
              <div className="spinner"></div>
              <span>System Syncing...</span>
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
    </div>
  );
}

export default TodoApp;
