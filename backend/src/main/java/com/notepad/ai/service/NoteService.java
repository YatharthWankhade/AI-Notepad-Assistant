package com.notepad.ai.service;

import com.notepad.ai.client.AiClient;
import com.notepad.ai.model.NoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class NoteService {


    private final AiClient aiClient;

    public NoteService(AiClient aiClient) {
        this.aiClient = aiClient;
    }

    public List<NoteResponse> analyzeNotes(String content) {
        if (content == null || content.isBlank()) {
            return List.of();
        }
        // Smart Grouping: Send the entire content to the AI at once
        // The AI will handle grouping and splitting into multiple structured responses
        return aiClient.analyze(content);
    }
}
