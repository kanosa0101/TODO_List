import authService from './authService';

const API_BASE_URL = '/api/notes';

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

class NoteService {
  async getAllNotes() {
    const response = await fetch(API_BASE_URL, {
      headers: getHeaders(),
    });
    await handleResponse(response);
    return response.json();
  }

  async getNoteById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: getHeaders(),
    });
    await handleResponse(response);
    return response.json();
  }

  async createNote(note) {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(note),
    });
    await handleResponse(response);
    return response.json();
  }

  async updateNote(id, updates) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    await handleResponse(response);
    return response.json();
  }

  async partialUpdateNote(id, updates) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    await handleResponse(response);
    return response.json();
  }

  async deleteNote(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await handleResponse(response);
  }
}

export default new NoteService();
