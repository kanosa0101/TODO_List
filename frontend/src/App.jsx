import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TodoApp from './components/TodoApp';
import NoteApp from './components/NoteApp';
import AgentApp from './components/AgentApp';
import LandingPage from './components/LandingPage';
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
        {/* Landing Page - Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Page - Redirect to /app if authenticated */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/app" replace /> : <LoginForm />
        } />

        {/* Register Page - Redirect to /app if authenticated */}
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/app" replace /> : <RegisterForm />
        } />

        {/* Main App - Protected */}
        <Route path="/app" element={
          isAuthenticated ? (
            <ProtectedRoute>
              <TodoApp />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* Notes Page - Protected */}
        <Route path="/notes" element={
          <ProtectedRoute>
            <NoteApp />
          </ProtectedRoute>
        } />

        {/* AI Agent Page - Protected */}
        <Route path="/agent" element={
          <ProtectedRoute>
            <AgentApp />
          </ProtectedRoute>
        } />

        {/* Catch all - Redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
