const API_BASE_URL = '/api/todos';

class TodoService {
  async getAllTodos(filter = null) {
    const url = filter && filter !== 'ALL' 
      ? `${API_BASE_URL}?filter=${filter}` 
      : API_BASE_URL;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('获取待办事项失败');
    }
    return response.json();
  }

  async getTodoById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('获取待办事项失败');
    }
    return response.json();
  }

  async createTodo(todo) {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    if (!response.ok) {
      throw new Error('创建待办事项失败');
    }
    return response.json();
  }

  async updateTodo(id, updates) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('更新待办事项失败');
    }
    return response.json();
  }

  async partialUpdateTodo(id, updates) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('更新待办事项失败');
    }
    return response.json();
  }

  async deleteTodo(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('删除待办事项失败');
    }
  }
}

export default new TodoService();

