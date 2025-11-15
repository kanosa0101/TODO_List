package com.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "待办事项请求")
public class TodoRequest {
    @Schema(description = "待办事项内容", required = true, example = "完成项目文档", maxLength = 500)
    @NotBlank(message = "待办事项内容不能为空")
    @Size(max = 500, message = "待办事项内容不能超过500个字符")
    private String text;
    
    @Schema(description = "优先级：LOW(低)、MEDIUM(中)、HIGH(高)", example = "MEDIUM", allowableValues = {"LOW", "MEDIUM", "HIGH"})
    private String priority; // LOW, MEDIUM, HIGH
    
    @Schema(description = "总步骤数", example = "5")
    private Integer totalSteps; // 总步骤数
    
    @Schema(description = "预计时长数值", example = "30")
    private Integer estimatedDuration; // 预计时长数值
    
    @Schema(description = "时长单位：MINUTES(分钟)、HOURS(小时)、DAYS(天)", example = "MINUTES", allowableValues = {"MINUTES", "HOURS", "DAYS"})
    private String durationUnit; // 时长单位：MINUTES, HOURS, DAYS
    
    @Schema(description = "是否为每日任务", example = "false")
    private Boolean isDaily; // 是否为每日任务

    @Schema(description = "截止时间（非每日任务，向后兼容字段）", example = "2024-12-31T23:59:59")
    private LocalDateTime dueDate; // 非每日任务截止时间（可选，向后兼容）

    @Schema(description = "截止日期（新增字段，优先使用）", example = "2024-12-31T23:59:59")
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

