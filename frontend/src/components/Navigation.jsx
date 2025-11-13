import { Link, useLocation } from 'react-router-dom';
import '../styles/components.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="main-navigation">
      <Link 
        to="/" 
        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
      >
        📋 待办
      </Link>
      <Link 
        to="/notes" 
        className={`nav-link ${location.pathname === '/notes' ? 'active' : ''}`}
      >
        📝 笔记
      </Link>
    </nav>
  );
}

export default Navigation;

