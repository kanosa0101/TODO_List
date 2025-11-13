package com.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class TodoRequest {
    @NotBlank(message = "待办事项内容不能为空")
    @Size(max = 500, message = "待办事项内容不能超过500个字符")
    private String text;
    
    private String priority; // LOW, MEDIUM, HIGH
    
    private Integer totalSteps; // 总步骤数
    
    private Integer estimatedDuration; // 预计时长数值
    
    private String durationUnit; // 时长单位：MINUTES, HOURS, DAYS
    
    private Boolean isDaily; // 是否为每日任务

    private LocalDateTime dueDate; // 非每日任务截止时间（可选，向后兼容）

    private LocalDateTime deadline; // 截止日期（新增字段）

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

    public Integer getTotalSteps() {
        return totalSteps;
    }

    public void setTotalSteps(Integer totalSteps) {
        this.totalSteps = totalSteps;
    }

    public Integer getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(Integer estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public String getDurationUnit() {
        return durationUnit;
    }

    public void setDurationUnit(String durationUnit) {
        this.durationUnit = durationUnit;
    }

    public Boolean getIsDaily() {
        return isDaily;
    }

    public void setIsDaily(Boolean isDaily) {
        this.isDaily = isDaily;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }
}

