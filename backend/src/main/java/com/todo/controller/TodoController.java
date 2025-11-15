package com.todo.controller;

import com.todo.dto.TodoRequest;
import com.todo.exception.TodoNotFoundException;
import com.todo.model.Todo;
import com.todo.service.TodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")
@Tag(name = "待办事项管理", description = "待办事项的增删改查等操作接口")
@SecurityRequirement(name = "Bearer Authentication")
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

    private LocalDateTime extractLocalDateTime(Map<String, Object> updates, String key, LocalDateTime defaultValue) {
        if (!updates.containsKey(key)) {
            return defaultValue;
        }
        Object value = updates.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime) {
            return (LocalDateTime) value;
        }
        if (value instanceof String) {
            String str = ((String) value).trim();
            if (str.isEmpty()) {
                return null;
            }
            try {
                return LocalDateTime.parse(str);
            } catch (DateTimeParseException e) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    @Operation(summary = "获取所有待办事项", description = "获取当前用户的所有待办事项，支持按状态筛选（all/active/completed）")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功",
                    content = @Content(schema = @Schema(implementation = Todo.class)))
    })
    @GetMapping
    public ResponseEntity<List<Todo>> getAllTodos(
            @Parameter(description = "筛选条件：all(全部)、active(未完成)、completed(已完成)", example = "all")
            @RequestParam(required = false) String filter) {
        return ResponseEntity.ok(todoService.getAllTodos(filter));
    }

    @Operation(summary = "根据ID获取待办事项", description = "根据待办事项ID获取详细信息")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功",
                    content = @Content(schema = @Schema(implementation = Todo.class))),
            @ApiResponse(responseCode = "404", description = "待办事项不存在")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(
            @Parameter(description = "待办事项ID", required = true, example = "1")
            @PathVariable Long id) {
        return todoService.getTodoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "创建待办事项", description = "创建新的待办事项")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "创建成功",
                    content = @Content(schema = @Schema(implementation = Todo.class))),
            @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
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
            todo.setDueDate(null);
            todo.setDeadline(null);
        } else {
            // 优先使用deadline，如果没有则使用dueDate（向后兼容）
            if (request.getDeadline() != null) {
                todo.setDeadline(request.getDeadline());
                todo.setDueDate(request.getDeadline()); // 同时设置dueDate以保持兼容
            } else if (request.getDueDate() != null) {
                todo.setDueDate(request.getDueDate());
                todo.setDeadline(request.getDueDate()); // 将dueDate复制到deadline
            }
        }
        
        Todo createdTodo = todoService.createTodo(todo);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTodo);
    }

    @Operation(summary = "更新待办事项", description = "完整更新待办事项的所有字段")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "更新成功",
                    content = @Content(schema = @Schema(implementation = Todo.class))),
            @ApiResponse(responseCode = "404", description = "待办事项不存在")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(
            @Parameter(description = "待办事项ID", required = true, example = "1")
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
        
        boolean updatedIsDaily = updates.containsKey("isDaily")
                ? Boolean.TRUE.equals(updates.get("isDaily"))
                : existingTodo.isDaily();
        updatedTodo.setDaily(updatedIsDaily);
        if (updatedIsDaily) {
            updatedTodo.setDueDate(null);
            updatedTodo.setDeadline(null);
        } else {
            // 优先使用deadline，如果没有则使用dueDate（向后兼容）
            LocalDateTime deadline = extractLocalDateTime(updates, "deadline", existingTodo.getDeadline());
            LocalDateTime dueDate = extractLocalDateTime(updates, "dueDate", existingTodo.getDueDate());
            if (deadline != null) {
                updatedTodo.setDeadline(deadline);
                updatedTodo.setDueDate(deadline); // 同时设置dueDate以保持兼容
            } else if (dueDate != null) {
                updatedTodo.setDueDate(dueDate);
                updatedTodo.setDeadline(dueDate); // 将dueDate复制到deadline
            } else {
                updatedTodo.setDueDate(existingTodo.getDueDate());
                updatedTodo.setDeadline(existingTodo.getDeadline());
            }
        }

        return ResponseEntity.ok(todoService.updateTodo(id, updatedTodo));
    }

    @Operation(summary = "部分更新待办事项", description = "只更新待办事项的指定字段")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "更新成功",
                    content = @Content(schema = @Schema(implementation = Todo.class))),
            @ApiResponse(responseCode = "404", description = "待办事项不存在")
    })
    @PatchMapping("/{id}")
    public ResponseEntity<Todo> partialUpdateTodo(
            @Parameter(description = "待办事项ID", required = true, example = "1")
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
        
        boolean updatedIsDaily = updates.containsKey("isDaily")
                ? Boolean.TRUE.equals(updates.get("isDaily"))
                : existingTodo.isDaily();
        updatedTodo.setDaily(updatedIsDaily);
        if (updatedIsDaily) {
            updatedTodo.setDueDate(null);
            updatedTodo.setDeadline(null);
        } else {
            // 优先使用deadline，如果没有则使用dueDate（向后兼容）
            LocalDateTime deadline = null;
            LocalDateTime dueDate = null;
            if (updates.containsKey("deadline")) {
                deadline = extractLocalDateTime(updates, "deadline", null);
            } else {
                deadline = existingTodo.getDeadline();
            }
            if (updates.containsKey("dueDate")) {
                dueDate = extractLocalDateTime(updates, "dueDate", null);
            } else {
                dueDate = existingTodo.getDueDate();
            }
            
            if (deadline != null) {
                updatedTodo.setDeadline(deadline);
                updatedTodo.setDueDate(deadline); // 同时设置dueDate以保持兼容
            } else if (dueDate != null) {
                updatedTodo.setDueDate(dueDate);
                updatedTodo.setDeadline(dueDate); // 将dueDate复制到deadline
            } else {
                updatedTodo.setDueDate(existingTodo.getDueDate());
                updatedTodo.setDeadline(existingTodo.getDeadline());
            }
        }

        return ResponseEntity.ok(todoService.updateTodo(id, updatedTodo));
    }

    @Operation(summary = "删除待办事项", description = "根据ID删除待办事项")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "删除成功"),
            @ApiResponse(responseCode = "404", description = "待办事项不存在")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(
            @Parameter(description = "待办事项ID", required = true, example = "1")
            @PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
}
