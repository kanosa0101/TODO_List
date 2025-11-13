package com.todo.controller;

import com.todo.dto.NoteRequest;
import com.todo.exception.NoteNotFoundException;
import com.todo.model.Note;
import com.todo.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class NoteController {
    
    private final NoteService noteService;

    @Autowired
    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@Valid @RequestBody NoteRequest request) {
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent() != null ? request.getContent() : "");
        
        Note createdNote = noteService.createNote(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request) {
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent() != null ? request.getContent() : "");
        
        Note updatedNote = noteService.updateNote(id, note);
        return ResponseEntity.ok(updatedNote);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Note> partialUpdateNote(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        Note existingNote = noteService.getNoteById(id)
                .orElseThrow(() -> new NoteNotFoundException(id));

        Note updatedNote = new Note();
        if (updates.containsKey("title")) {
            updatedNote.setTitle((String) updates.get("title"));
        } else {
            updatedNote.setTitle(existingNote.getTitle());
        }
        
        if (updates.containsKey("content")) {
            updatedNote.setContent((String) updates.get("content"));
        } else {
            updatedNote.setContent(existingNote.getContent());
        }

        Note savedNote = noteService.updateNote(id, updatedNote);
        return ResponseEntity.ok(savedNote);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
