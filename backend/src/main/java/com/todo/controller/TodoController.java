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

        return ResponseEntity.ok(todoService.updateTodo(id, updatedTodo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
}
