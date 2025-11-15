package com.todo.controller;

import com.todo.dto.NoteRequest;
import com.todo.exception.NoteNotFoundException;
import com.todo.model.Note;
import com.todo.service.NoteService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
@Tag(name = "笔记管理", description = "笔记的增删改查等操作接口")
@SecurityRequirement(name = "Bearer Authentication")
public class NoteController {
    
    private final NoteService noteService;

    @Autowired
    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @Operation(summary = "获取所有笔记", description = "获取当前用户的所有笔记")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功",
                    content = @Content(schema = @Schema(implementation = Note.class)))
    })
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    @Operation(summary = "根据ID获取笔记", description = "根据笔记ID获取详细信息")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "获取成功",
                    content = @Content(schema = @Schema(implementation = Note.class))),
            @ApiResponse(responseCode = "404", description = "笔记不存在")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(
            @Parameter(description = "笔记ID", required = true, example = "1")
            @PathVariable Long id) {
        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "创建笔记", description = "创建新的笔记")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "创建成功",
                    content = @Content(schema = @Schema(implementation = Note.class))),
            @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public ResponseEntity<Note> createNote(@Valid @RequestBody NoteRequest request) {
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent() != null ? request.getContent() : "");
        
        Note createdNote = noteService.createNote(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
    }

    @Operation(summary = "更新笔记", description = "完整更新笔记的所有字段")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "更新成功",
                    content = @Content(schema = @Schema(implementation = Note.class))),
            @ApiResponse(responseCode = "404", description = "笔记不存在")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(
            @Parameter(description = "笔记ID", required = true, example = "1")
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request) {
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent() != null ? request.getContent() : "");
        
        Note updatedNote = noteService.updateNote(id, note);
        return ResponseEntity.ok(updatedNote);
    }

    @Operation(summary = "部分更新笔记", description = "只更新笔记的指定字段")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "更新成功",
                    content = @Content(schema = @Schema(implementation = Note.class))),
            @ApiResponse(responseCode = "404", description = "笔记不存在")
    })
    @PatchMapping("/{id}")
    public ResponseEntity<Note> partialUpdateNote(
            @Parameter(description = "笔记ID", required = true, example = "1")
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

    @Operation(summary = "删除笔记", description = "根据ID删除笔记")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "删除成功"),
            @ApiResponse(responseCode = "404", description = "笔记不存在")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @Parameter(description = "笔记ID", required = true, example = "1")
            @PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
