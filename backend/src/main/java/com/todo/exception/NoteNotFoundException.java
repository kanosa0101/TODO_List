package com.todo.exception;

public class NoteNotFoundException extends RuntimeException {
    public NoteNotFoundException(Long id) {
        super("笔记未找到: " + id);
    }
}
