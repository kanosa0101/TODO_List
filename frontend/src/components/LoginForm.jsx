import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      authService.setAuth(response.token, {
        username: response.username,
        userId: response.userId,
      });
      // 使用 window.location 强制刷新页面，确保认证状态更新
      window.location.href = '/app';
    } catch (err) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{ color: '#ff4d4f', marginBottom: '1rem' }}>{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="username">Username</label>
            <input
              className="input-field"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              className="input-field"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)' }}>Register</Link>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/" style={{ color: 'var(--accent-primary)' }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

