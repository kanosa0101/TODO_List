package com.todo.service;

import com.todo.exception.TodoNotFoundException;
import com.todo.model.Todo;
import com.todo.model.User;
import com.todo.repository.TodoRepository;
import com.todo.repository.UserRepository;
import com.todo.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TodoService {
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    @Autowired
    public TodoService(TodoRepository todoRepository, UserRepository userRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityUtil.getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("未找到当前用户");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    public List<Todo> getAllTodos(String filter) {
        User currentUser = getCurrentUser();
        List<Todo> todos;
        
        if (filter != null) {
            switch (filter) {
                case "COMPLETED":
                    todos = todoRepository.findByUserAndCompletedTrue(currentUser);
                    break;
                case "ACTIVE":
                    todos = todoRepository.findByUserAndCompletedFalse(currentUser);
                    break;
                default:
                    todos = todoRepository.findByUser(currentUser);
            }
        } else {
            todos = todoRepository.findByUser(currentUser);
        }
        
        // 重置每日任务
        LocalDate today = LocalDate.now();
        for (Todo todo : todos) {
            try {
                // 确保isDaily字段有默认值（兼容旧数据）
                if (todo.getDurationUnit() == null) {
                    todo.setDurationUnit("MINUTES");
                }
                
                if (todo.isDaily()) {
                    if (todo.getLastResetDate() != null) {
                        LocalDate lastResetDate = todo.getLastResetDate().toLocalDate();
                        if (!lastResetDate.equals(today)) {
                            // 新的一天，重置任务状态
                            todo.setCompleted(false);
                            if (todo.getCompletedSteps() != null) {
                                todo.setCompletedSteps(0);
                            }
                            todo.setLastResetDate(LocalDateTime.now());
                            todoRepository.save(todo);
                        }
                    } else {
                        // 首次设置每日任务
                        todo.setLastResetDate(LocalDateTime.now());
                        todoRepository.save(todo);
                    }
                }
            } catch (Exception e) {
                // 如果处理某个任务时出错，记录日志但继续处理其他任务
                System.err.println("处理任务 " + todo.getId() + " 时出错: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return todos;
    }

    public Optional<Todo> getTodoById(Long id) {
        User currentUser = getCurrentUser();
        return todoRepository.findByIdAndUser(id, currentUser);
    }

    public Todo createTodo(Todo todo) {
        User currentUser = getCurrentUser();
        todo.setUser(currentUser);
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());
        return todoRepository.save(todo);
    }

    public Todo updateTodo(Long id, Todo updatedTodo) {
        User currentUser = getCurrentUser();
        Todo existingTodo = todoRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new TodoNotFoundException(id));
        
        if (updatedTodo.getText() != null) {
            existingTodo.setText(updatedTodo.getText());
        }
        existingTodo.setCompleted(updatedTodo.isCompleted());
        if (updatedTodo.getPriority() != null) {
            existingTodo.setPriority(updatedTodo.getPriority());
        }
        if (updatedTodo.getTotalSteps() != null) {
            existingTodo.setTotalSteps(updatedTodo.getTotalSteps());
        }
        if (updatedTodo.getCompletedSteps() != null) {
            existingTodo.setCompletedSteps(updatedTodo.getCompletedSteps());
        }
        if (updatedTodo.getEstimatedDuration() != null) {
            existingTodo.setEstimatedDuration(updatedTodo.getEstimatedDuration());
        }
        if (updatedTodo.getDurationUnit() != null) {
            existingTodo.setDurationUnit(updatedTodo.getDurationUnit());
        }
        existingTodo.setDaily(updatedTodo.isDaily());
        if (updatedTodo.isDaily()) {
            if (existingTodo.getLastResetDate() == null) {
                existingTodo.setLastResetDate(LocalDateTime.now());
            }
            existingTodo.setDueDate(null);
        } else {
            existingTodo.setLastResetDate(null);
            existingTodo.setDueDate(updatedTodo.getDueDate());
        }
        existingTodo.setUpdatedAt(LocalDateTime.now());
        
        return todoRepository.save(existingTodo);
    }

    public void deleteTodo(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("待办事项ID不能为空");
        }
        User currentUser = getCurrentUser();
        if (!todoRepository.existsByIdAndUser(id, currentUser)) {
            throw new TodoNotFoundException(id);
        }
        todoRepository.deleteById(id);
    }
}
