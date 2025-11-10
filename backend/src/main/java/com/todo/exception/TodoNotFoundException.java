package com.todo.exception;

public class TodoNotFoundException extends RuntimeException {
    public TodoNotFoundException(String message) {
        super(message);
    }

    public TodoNotFoundException(Long id) {
        super("待办事项不存在，ID: " + id);
    }
}

