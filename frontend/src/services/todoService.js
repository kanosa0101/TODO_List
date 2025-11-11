import authService from './authService';

const API_BASE_URL = '/api/todos';

// 获取请求头，自动添加Authorization
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = authService.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// 处理响应错误
async function handleResponse(response) {
  if (response.status === 401) {
    // Token过期或无效，清除本地存储并跳转到登录页
    authService.logout();
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  if (!response.ok) {
    let errorMessage = `请求失败: ${response.status}`;
    try {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    } catch (e) {
      // 忽略解析错误
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  return response;
}

class TodoService {
  async getAllTodos(filter = null) {
    const url = filter && filter !== 'ALL' 
      ? `${API_BASE_URL}?filter=${filter}` 
      : API_BASE_URL;
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    await handleResponse(response);
    const data = await response.json();
    return data;
  }

  async getTodoById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: getHeaders(),
    });
    handleResponse(response);
    return response.json();
  }

  async createTodo(todo) {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(todo),
    });
    handleResponse(response);
    return response.json();
  }

  async updateTodo(id, updates) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    handleResponse(response);
    return response.json();
  }

  async partialUpdateTodo(id, updates) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    handleResponse(response);
    return response.json();
  }

  async deleteTodo(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    handleResponse(response);
  }
}

export default new TodoService();

