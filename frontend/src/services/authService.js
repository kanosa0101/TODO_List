const API_BASE_URL = '/api/auth';

class AuthService {
  async register(username, password, email) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '注册失败' }));
      throw new Error(error.message || '注册失败');
    }
    
    return response.json();
  }

  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '登录失败' }));
      throw new Error(error.message || '用户名或密码错误');
    }
    
    return response.json();
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  getToken() {
    return sessionStorage.getItem('token');
  }

  getUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setAuth(token, user) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();

