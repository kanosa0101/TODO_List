import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TodoApp from './components/TodoApp';
import NoteApp from './components/NoteApp';
import AgentApp from './components/AgentApp';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查认证状态
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页面 - 未认证时显示，已认证时重定向到主页 */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
        } />
        {/* 注册页面 - 未认证时显示，已认证时重定向到主页 */}
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterForm />
        } />
        {/* 主页 - 已认证时显示，未认证时显示登录页面 */}
        <Route path="/" element={
          isAuthenticated ? (
            <ProtectedRoute>
              <TodoApp />
            </ProtectedRoute>
          ) : (
            <LoginForm />
          )
        } />
        {/* 笔记页面 - 需要认证 */}
        <Route path="/notes" element={
          <ProtectedRoute>
            <NoteApp />
          </ProtectedRoute>
        } />
        {/* AI助手页面 - 需要认证 */}
        <Route path="/agent" element={
          <ProtectedRoute>
            <AgentApp />
          </ProtectedRoute>
        } />
        {/* 其他路径 - 未认证时显示登录页面，已认证时重定向到主页 */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
