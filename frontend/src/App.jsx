import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import TodoApp from './components/TodoApp';
import NoteApp from './components/NoteApp';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';

function App() {
  // 页面加载时检查是否需要清除认证信息
  useEffect(() => {
    // 检查是否是首次访问（没有sessionStorage标记）
    const sessionKey = 'todo_app_session';
    const sessionId = sessionStorage.getItem(sessionKey);
    
    if (!sessionId) {
      // 首次访问或浏览器重启，清除认证信息
      authService.logout();
      // 生成新的会话ID
      sessionStorage.setItem(sessionKey, Date.now().toString());
    }
    
    // 监听页面卸载事件，清除会话标记（这样下次打开就是新会话）
    const handleBeforeUnload = () => {
      // 不在这里清除，让浏览器自然关闭时清除sessionStorage
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          authService.isAuthenticated() ? <Navigate to="/" replace /> : <LoginForm />
        } />
        <Route path="/register" element={
          authService.isAuthenticated() ? <Navigate to="/" replace /> : <RegisterForm />
        } />
        <Route path="/" element={
          authService.isAuthenticated() ? (
            <ProtectedRoute>
              <TodoApp />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/notes" element={
          <ProtectedRoute>
            <NoteApp />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          authService.isAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
