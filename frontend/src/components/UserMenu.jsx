import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './UserMenu.css';

function UserMenu() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = () => {
    setShowMenu(false); // 关闭菜单
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <div className="user-info" onClick={() => setShowMenu(!showMenu)}>
        <span className="user-avatar">👤</span>
        <span className="username">{user.username}</span>
        <span className="dropdown-arrow">{showMenu ? '▲' : '▼'}</span>
      </div>
      {showMenu && (
        <div className="user-menu-dropdown">
          <div className="menu-item" onClick={handleLogout}>
            退出登录
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;

