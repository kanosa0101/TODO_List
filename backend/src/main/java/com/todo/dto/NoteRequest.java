package com.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "笔记请求")
public class NoteRequest {
    @Schema(description = "笔记标题", required = true, example = "会议记录", maxLength = 255)
    @NotBlank(message = "笔记标题不能为空")
    @Size(max = 255, message = "笔记标题不能超过255个字符")
    private String title;
    
    @Schema(description = "笔记内容", example = "今天讨论了项目的进展...")
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
