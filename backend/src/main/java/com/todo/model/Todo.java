package com.todo.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "todos")
@Schema(description = "待办事项实体")
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "待办事项ID", example = "1")
    private Long id;
    
    @Column(nullable = false, length = 500)
    @Schema(description = "待办事项内容", example = "完成项目文档")
    private String text;
    
    @Column(nullable = false)
    @Schema(description = "是否已完成", example = "false")
    private boolean completed;
    
    @Column(nullable = false, length = 20)
    @Schema(description = "优先级：LOW(低)、MEDIUM(中)、HIGH(高)", example = "MEDIUM")
    private String priority; // LOW, MEDIUM, HIGH
    
    @Column(nullable = true)
    private Integer totalSteps; // 总步骤数，用户设置
    
    @Column(nullable = true)
    private Integer completedSteps; // 已完成步骤数，默认为0
    
    @Column(nullable = true)
    private Integer estimatedDuration; // 预计时长数值，用户设置
    
    @Column(nullable = true, length = 20)
    private String durationUnit; // 时长单位：MINUTES, HOURS, DAYS
    
    @Column(nullable = true)
    private LocalDateTime dueDate; // 非每日任务截止时间（可选，向后兼容）
    
    @Column(nullable = true)
    private LocalDateTime deadline; // 截止日期（新增字段）
    
    @Column(nullable = false)
    @JsonProperty("isDaily")
    private boolean isDaily; // 是否为每日任务
    
    @Column(nullable = true)
    private LocalDateTime lastResetDate; // 上次重置日期（用于每日任务）
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Todo() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.priority = "MEDIUM";
        this.completed = false;
        this.completedSteps = 0;
        this.isDaily = false;
        this.durationUnit = null; // 默认为null，只有在设置了estimatedDuration时才设置
        this.dueDate = null;
        this.deadline = null;
    }

    public Todo(Long id, String text, boolean completed, String priority) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.priority = priority != null ? priority : "MEDIUM";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
        this.updatedAt = LocalDateTime.now();
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getTotalSteps() {
        return totalSteps;
    }

    public void setTotalSteps(Integer totalSteps) {
        this.totalSteps = totalSteps;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getCompletedSteps() {
        return completedSteps;
    }

    public void setCompletedSteps(Integer completedSteps) {
        this.completedSteps = completedSteps;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(Integer estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
        this.updatedAt = LocalDateTime.now();
    }

    public String getDurationUnit() {
        return durationUnit;
    }

    public void setDurationUnit(String durationUnit) {
        this.durationUnit = durationUnit;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isDaily() {
        return isDaily;
    }

    public void setDaily(boolean daily) {
        isDaily = daily;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getLastResetDate() {
        return lastResetDate;
    }

    public void setLastResetDate(LocalDateTime lastResetDate) {
        this.lastResetDate = lastResetDate;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
        this.updatedAt = LocalDateTime.now();
    }
}

