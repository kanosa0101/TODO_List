package com.todo.controller;

import com.todo.dto.TodoRequest;
import com.todo.exception.TodoNotFoundException;
import com.todo.model.Todo;
import com.todo.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
public class TodoController {
    
    private final TodoService todoService;

    @Autowired
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    private Integer extractInteger(Map<String, Object> updates, String key, Integer defaultValue) {
        if (!updates.containsKey(key)) {
            return defaultValue;
        }
        Object value = updates.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    @GetMapping
    public ResponseEntity<List<Todo>> getAllTodos(
            @RequestParam(required = false) String filter) {
        return ResponseEntity.ok(todoService.getAllTodos(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        return todoService.getTodoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Todo> createTodo(@Valid @RequestBody TodoRequest request) {
        Todo todo = new Todo();
        todo.setText(request.getText());
        todo.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        todo.setCompleted(false);
        todo.setTotalSteps(request.getTotalSteps());
        todo.setCompletedSteps(0);
        todo.setEstimatedDuration(request.getEstimatedDuration());
        // 只有在提供了estimatedDuration时才设置durationUnit
        if (request.getEstimatedDuration() != null) {
            todo.setDurationUnit(request.getDurationUnit() != null ? request.getDurationUnit() : "MINUTES");
        } else {
            todo.setDurationUnit(null);
        }
        todo.setDaily(request.getIsDaily() != null ? request.getIsDaily() : false);
        if (todo.isDaily()) {
            todo.setLastResetDate(java.time.LocalDateTime.now());
        }
        
        Todo createdTodo = todoService.createTodo(todo);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTodo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        Todo existingTodo = todoService.getTodoById(id)
                .orElseThrow(() -> new TodoNotFoundException(id));

        Todo updatedTodo = new Todo();
        updatedTodo.setText((String) updates.getOrDefault("text", existingTodo.getText()));
        updatedTodo.setCompleted((Boolean) updates.getOrDefault("completed", existingTodo.isCompleted()));
        updatedTodo.setPriority((String) updates.getOrDefault("priority", existingTodo.getPriority()));
        updatedTodo.setTotalSteps(extractInteger(updates, "totalSteps", existingTodo.getTotalSteps()));
        updatedTodo.setCompletedSteps(extractInteger(updates, "completedSteps", existingTodo.getCompletedSteps()));
        updatedTodo.setEstimatedDuration(extractInteger(updates, "estimatedDuration", existingTodo.getEstimatedDuration()));
        
        if (updates.containsKey("durationUnit")) {
            updatedTodo.setDurationUnit((String) updates.get("durationUnit"));
        } else {
            updatedTodo.setDurationUnit(existingTodo.getDurationUnit());
        }
        
        if (updates.containsKey("isDaily")) {
            updatedTodo.setDaily((Boolean) updates.get("isDaily"));
        } else {
            updatedTodo.setDaily(existingTodo.isDaily());
        }

        return ResponseEntity.ok(todoService.updateTodo(id, updatedTodo));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Todo> partialUpdateTodo(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        Todo existingTodo = todoService.getTodoById(id)
                .orElseThrow(() -> new TodoNotFoundException(id));

        Todo updatedTodo = new Todo();
        if (updates.containsKey("text")) {
            updatedTodo.setText((String) updates.get("text"));
        } else {
            updatedTodo.setText(existingTodo.getText());
        }
        
        updatedTodo.setCompleted(
            updates.containsKey("completed") 
                ? (Boolean) updates.get("completed") 
                : existingTodo.isCompleted()
        );
        
        updatedTodo.setPriority(
            updates.containsKey("priority") 
                ? (String) updates.get("priority") 
                : existingTodo.getPriority()
        );
        
        updatedTodo.setTotalSteps(extractInteger(updates, "totalSteps", existingTodo.getTotalSteps()));
        updatedTodo.setCompletedSteps(extractInteger(updates, "completedSteps", existingTodo.getCompletedSteps()));
        updatedTodo.setEstimatedDuration(extractInteger(updates, "estimatedDuration", existingTodo.getEstimatedDuration()));
        
        if (updates.containsKey("durationUnit")) {
            updatedTodo.setDurationUnit((String) updates.get("durationUnit"));
        } else {
            updatedTodo.setDurationUnit(existingTodo.getDurationUnit());
        }
        
        if (updates.containsKey("isDaily")) {
            updatedTodo.setDaily((Boolean) updates.get("isDaily"));
        } else {
            updatedTodo.setDaily(existingTodo.isDaily());
        }

        return ResponseEntity.ok(todoService.updateTodo(id, updatedTodo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
}
