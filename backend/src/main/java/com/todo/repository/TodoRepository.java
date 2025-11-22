package com.todo.repository;

import com.todo.model.Todo;
import com.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    
    // 查询指定用户的所有待办事项
    List<Todo> findByUser(User user);
    
    // 查询指定用户未完成的待办事项
    List<Todo> findByUserAndCompletedFalse(User user);
    
    // 查询指定用户已完成的待办事项
    List<Todo> findByUserAndCompletedTrue(User user);
    
    // 查询指定用户根据优先级查询
    List<Todo> findByUserAndPriority(User user, String priority);
    
    // 查询指定用户的待办事项，按创建时间降序排列
    @Query("SELECT t FROM Todo t WHERE t.user = :user ORDER BY t.createdAt DESC")
    List<Todo> findByUserOrderByCreatedAtDesc(User user);
    
    // 查询指定用户的指定ID待办事项
    Optional<Todo> findByIdAndUser(Long id, User user);
    
    // 检查指定用户的待办事项是否存在
    boolean existsByIdAndUser(Long id, User user);
    
    // 查询所有完成时间早于指定日期的已完成任务
    @Query("SELECT t FROM Todo t WHERE t.completed = true AND t.completedAt IS NOT NULL AND t.completedAt < :cutoffDate")
    List<Todo> findCompletedBefore(LocalDateTime cutoffDate);
}
