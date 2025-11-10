package com.todo.service;

import com.todo.exception.TodoNotFoundException;
import com.todo.model.Todo;
import com.todo.repository.TodoRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TodoService {
    private final TodoRepository todoRepository;

    @Autowired
    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    @PostConstruct
    public void initializeDefaultData() {
        // 如果数据库为空，初始化示例数据
        if (todoRepository.count() == 0) {
            Todo todo1 = new Todo();
            todo1.setText("学习 React");
            todo1.setPriority("HIGH");
            todo1.setCompleted(false);
            
            Todo todo2 = new Todo();
            todo2.setText("学习 Spring Boot");
            todo2.setPriority("MEDIUM");
            todo2.setCompleted(true);
            
            todoRepository.save(todo1);
            todoRepository.save(todo2);
            
            System.out.println("已初始化示例数据");
        }
    }

    public List<Todo> getAllTodos(String filter) {
        if (filter != null) {
            switch (filter) {
                case "COMPLETED":
                    return todoRepository.findByCompletedTrue();
                case "ACTIVE":
                    return todoRepository.findByCompletedFalse();
                default:
                    return todoRepository.findAll();
            }
        }
        return todoRepository.findAll();
    }

    public Optional<Todo> getTodoById(Long id) {
        return todoRepository.findById(id);
    }

    public Todo createTodo(Todo todo) {
        todo.setCreatedAt(LocalDateTime.now());
        todo.setUpdatedAt(LocalDateTime.now());
        return todoRepository.save(todo);
    }

    public Todo updateTodo(Long id, Todo updatedTodo) {
        Todo existingTodo = todoRepository.findById(id)
                .orElseThrow(() -> new TodoNotFoundException(id));
        
        if (updatedTodo.getText() != null) {
            existingTodo.setText(updatedTodo.getText());
        }
        existingTodo.setCompleted(updatedTodo.isCompleted());
        if (updatedTodo.getPriority() != null) {
            existingTodo.setPriority(updatedTodo.getPriority());
        }
        existingTodo.setUpdatedAt(LocalDateTime.now());
        
        return todoRepository.save(existingTodo);
    }

    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new TodoNotFoundException(id);
        }
        todoRepository.deleteById(id);
    }
}
