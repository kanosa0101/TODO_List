package com.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class NoteRequest {
    @NotBlank(message = "笔记标题不能为空")
    @Size(max = 255, message = "笔记标题不能超过255个字符")
    private String title;
    
    private String content;

    public NoteRequest() {
    }

    public NoteRequest(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
