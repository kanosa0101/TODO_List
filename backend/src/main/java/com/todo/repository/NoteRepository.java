package com.todo.repository;

import com.todo.model.Note;
import com.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserOrderByUpdatedAtDesc(User user);
    Optional<Note> findByIdAndUser(Long id, User user);
    boolean existsByIdAndUser(Long id, User user);
}
