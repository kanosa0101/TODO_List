import { useState, useEffect } from 'react';
import todoService from './services/todoService';
import { FILTER } from './utils/constants';
import TodoStats from './components/TodoStats';
import TodoForm from './components/TodoForm';
import TodoFilter from './components/TodoFilter';
import TodoList from './components/TodoList';
import './styles/App.css';

function App() {
  const [allTodos, setAllTodos] = useState([]); // 存储所有待办事项（用于统计）
  const [todos, setTodos] = useState([]); // 当前显示的待办事项（筛选后）
  const [filter, setFilter] = useState(FILTER.ALL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setAllTodos(data);
    } catch (err) {
      setError('加载待办事项失败');
      console.error(err);
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
      const newTodo = await todoService.createTodo(todoData);
      setAllTodos([...allTodos, newTodo]); // 更新全部数据
      // applyFilter 会自动更新显示的数据
    } catch (err) {
      setError('添加待办事项失败');
      console.error(err);
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      setError(null);
      const updatedTodo = await todoService.partialUpdateTodo(id, { completed: !completed });
      setAllTodos(allTodos.map(t => t.id === id ? updatedTodo : t)); // 更新全部数据
      // applyFilter 会自动更新显示的数据
    } catch (err) {
      setError('更新待办事项失败');
      console.error(err);
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
      setError('更新待办事项失败');
      console.error(err);
    }
  };

  const handlePriorityChange = async (id, priority) => {
    try {
      setError(null);
      const updatedTodo = await todoService.partialUpdateTodo(id, { priority });
      setAllTodos(allTodos.map(t => t.id === id ? updatedTodo : t)); // 更新全部数据
      // applyFilter 会自动更新显示的数据
    } catch (err) {
      setError('更新优先级失败');
      console.error(err);
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
      setError('删除待办事项失败');
      console.error(err);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>
            <span className="icon">✨</span>
            我的待办清单
          </h1>
          <TodoStats todos={allTodos} />
        </div>

        <TodoForm onSubmit={handleAdd} />
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

export default App;
