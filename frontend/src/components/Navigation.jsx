import { Link, useLocation } from 'react-router-dom';
import '../styles/components.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="main-navigation">
      <Link
        to="/app"
        className={`nav-item ${location.pathname === '/app' || location.pathname === '/' ? 'active' : ''}`}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-text">待办事项</span>
      </Link>
      <Link
        to="/notes"
        className={`nav-item ${location.pathname === '/notes' ? 'active' : ''}`}
      >
        <span className="nav-icon">📝</span>
        <span className="nav-text">我的笔记</span>
      </Link>
      <Link
        to="/agent"
        className={`nav-item ${location.pathname === '/agent' ? 'active' : ''}`}
      >
        <span className="nav-icon">🤖</span>
        <span className="nav-text">AI助手</span>
      </Link>
    </nav>
  );
}

export default Navigation;
