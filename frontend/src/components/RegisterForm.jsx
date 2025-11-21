import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(username, password, email);
      authService.setAuth(response.token, {
        username: response.username,
        userId: response.userId,
      });
      // 使用 window.location 强制刷新页面，确保认证状态更新
      window.location.href = '/app';
    } catch (err) {
      setError(err.message || '注册失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
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
              placeholder="3-50 characters"
              required
              minLength={3}
              maxLength={50}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input
              className="input-field"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
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
              placeholder="Min 6 characters"
              required
              minLength={6}
              maxLength={100}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login</Link>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/" style={{ color: 'var(--accent-primary)' }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;

