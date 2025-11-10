package com.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TodoRequest {
    @NotBlank(message = "待办事项内容不能为空")
    @Size(max = 500, message = "待办事项内容不能超过500个字符")
    private String text;
    
    private String priority; // LOW, MEDIUM, HIGH

    public TodoRequest() {
    }

    public TodoRequest(String text, String priority) {
        this.text = text;
        this.priority = priority;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}

