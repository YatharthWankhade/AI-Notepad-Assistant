
package com.notepad.ai.controller;

import com.notepad.ai.model.Note;
import com.notepad.ai.model.NoteRequest;
import com.notepad.ai.model.NoteResponse;
import com.notepad.ai.model.User;
import com.notepad.ai.repository.UserRepository;
import com.notepad.ai.security.services.UserDetailsImpl;
import com.notepad.ai.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final UserRepository userRepository;

    @PostMapping("/analyze")
    public ResponseEntity<List<NoteResponse>> analyzeNotes(@RequestBody NoteRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = getCurrentUser();
        System.out.println("Analyze Request from: " + (user != null ? user.getUsername() : "Guest"));
        // If user is null (Guest), analyze but don't save. If ID provided, treat as update.
        return ResponseEntity.ok(noteService.analyzeAndSaveNotes(request.getId(), request.getContent(), user));
    }

    @GetMapping
    public ResponseEntity<List<Note>> getUserNotes() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).build(); // Only logged-in users can fetch history
        }
        return ResponseEntity.ok(noteService.getUserNotes(user));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }
}

