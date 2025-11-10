package com.todo.repository;

import com.todo.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    
    // 查询所有未完成的待办事项
    List<Todo> findByCompletedFalse();
    
    // 查询所有已完成的待办事项
    List<Todo> findByCompletedTrue();
    
    // 根据优先级查询
    List<Todo> findByPriority(String priority);
    
    // 按创建时间降序排列
    @Query("SELECT t FROM Todo t ORDER BY t.createdAt DESC")
    List<Todo> findAllOrderByCreatedAtDesc();
}
