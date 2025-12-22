package com.notepad.ai.controller;

import com.notepad.ai.model.NoteRequest;
import com.notepad.ai.model.NoteResponse;
import com.notepad.ai.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular frontend
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<List<NoteResponse>> analyzeNotes(@RequestBody NoteRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(noteService.analyzeNotes(request.getContent()));
    }
}
