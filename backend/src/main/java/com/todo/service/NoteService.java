package com.todo.service;

import com.todo.exception.NoteNotFoundException;
import com.todo.model.Note;
import com.todo.model.User;
import com.todo.repository.NoteRepository;
import com.todo.repository.UserRepository;
import com.todo.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NoteService {
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Autowired
    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityUtil.getCurrentUsername();
        if (username == null) {
            throw new RuntimeException("未找到当前用户");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    public List<Note> getAllNotes() {
        User currentUser = getCurrentUser();
        return noteRepository.findByUserOrderByUpdatedAtDesc(currentUser);
    }

    public Optional<Note> getNoteById(Long id) {
        User currentUser = getCurrentUser();
        return noteRepository.findByIdAndUser(id, currentUser);
    }

    public Note createNote(Note note) {
        User currentUser = getCurrentUser();
        note.setUser(currentUser);
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    public Note updateNote(Long id, Note updatedNote) {
        User currentUser = getCurrentUser();
        Note existingNote = noteRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new NoteNotFoundException(id));
        
        if (updatedNote.getTitle() != null) {
            existingNote.setTitle(updatedNote.getTitle());
        }
        if (updatedNote.getContent() != null) {
            existingNote.setContent(updatedNote.getContent());
        }
        existingNote.setUpdatedAt(LocalDateTime.now());
        
        return noteRepository.save(existingNote);
    }

    public void deleteNote(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("笔记ID不能为空");
        }
        User currentUser = getCurrentUser();
        if (!noteRepository.existsByIdAndUser(id, currentUser)) {
            throw new NoteNotFoundException(id);
        }
        noteRepository.deleteById(id);
    }
}
