
package com.notepad.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.notepad.ai.client.AiClient;
import com.notepad.ai.model.Note;
import com.notepad.ai.model.NoteResponse;
import com.notepad.ai.model.User;
import com.notepad.ai.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final AiClient aiClient;
    private final NoteRepository noteRepository;
    private final ObjectMapper objectMapper;

    public List<NoteResponse> analyzeAndSaveNotes(Long noteId, String content, User user) {
        if (content == null || content.isBlank()) {
            return List.of();
        }

        // 1. Analyze with AI
        List<NoteResponse> response = aiClient.analyze(content);

        // 2. Save to Database (Only if user is logged in)
        if (user != null) {
            try {
                Note note;
                if (noteId != null) {
                    // Start by checking if we own this note
                    note = noteRepository.findById(noteId).orElse(new Note());
                    // Security check: ensure user owns the note
                    if (note.getUser() != null && !note.getUser().getId().equals(user.getId())) {
                        System.out.println("Warning: User " + user.getId() + " tried to hijack note " + noteId);
                        return response; // validation failed, return analysis but don't save
                    }
                } else {
                    note = new Note();
                    note.setUser(user);
                }
                
                // Ensure user is set (for new or existing)
                if (note.getUser() == null) note.setUser(user);

                note.setContent(content);
                
                // Set a default title based on first line or timestamp
                String title = content.lines().findFirst().orElse("Untitled Note");
                if (title.length() > 50) title = title.substring(0, 47) + "...";
                note.setTitle(title);

                // Serialize response to store as JSON
                String jsonResponse = objectMapper.writeValueAsString(response);
                note.setAiResponseJson(jsonResponse);
                
                noteRepository.save(note);
                System.out.println("Saved note " + note.getId() + " for user " + user.getUsername());
                
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        } else {
             System.out.println("Analyzing for guest - no save.");
        }

        return response;
    }

    public List<Note> getUserNotes(User user) {
        return noteRepository.findByUserId(user.getId());
    }
}

