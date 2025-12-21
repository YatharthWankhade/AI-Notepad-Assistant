package com.notepad.ai.client;

import com.notepad.ai.model.NoteResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockAiClient implements AiClient {

    @Override
    public List<NoteResponse> analyze(String noteContent) {
        // Simulate network delay
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Mock Smart Grouping: simpler just return one grouped result for now or split manually
        // For mock, let's just return one response wrapping the content
        return List.of(new NoteResponse(
                noteContent,
                "Mock Smart Analysis",
                generateMockSolution(noteContent)
        ));
    }

    private String generateMockTitle(String content) {
        String[] words = content.split("\\s+");
        StringBuilder title = new StringBuilder();
        for (int i = 0; i < Math.min(6, words.length); i++) {
            title.append(words[i]).append(" ");
        }
        if (words.length > 6) title.append("...");
        return title.toString().trim();
    }

    private List<String> generateMockSolution(String content) {
        return List.of(
                "Analyze the key constraints of: " + content,
                "Identify potential bottlenecks.",
                "Propose a scalable architecture.",
                "Implement proof of concept."
        );
    }
}
