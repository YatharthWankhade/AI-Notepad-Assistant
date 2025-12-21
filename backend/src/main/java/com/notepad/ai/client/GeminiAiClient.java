package com.notepad.ai.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.notepad.ai.model.NoteResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "gemini")
public class GeminiAiClient implements AiClient {

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.model:gemini-1.5-flash}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    @Override
    public List<NoteResponse> analyze(String noteContent) {
        String url = String.format(API_URL_TEMPLATE, model, apiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = buildPrompt(noteContent);
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            return parseResponse(response);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private String buildPrompt(String content) {
        return "You are a smart note assistant. Analyze the following notes and group them into logical categories.\n" +
               "Return the result STRICTLY as a JSON array of objects with the following structure:\n" +
               "[\n" +
               "  {\n" +
               "    \"originalPoint\": \"summary of the group or original text\",\n" +
               "    \"title\": \"A short title for the group\",\n" +
               "    \"solution\": [\"step 1\", \"step 2\", \"step 3\"]\n" +
               "  }\n" +
               "]\n\n" +
               "Do not include any markdown formatting (like ```json). Just the raw JSON string.\n\n" +
               "Notes to analyze:\n" +
               content;
    }

    private List<NoteResponse> parseResponse(Map<String, Object> response) {
        try {
            if (response == null || !response.containsKey("candidates")) return List.of();

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates.isEmpty()) return List.of();

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String text = (String) parts.get(0).get("text");

            // Clean up potential markdown code blocks if the AI disregards instruction
            text = text.trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            }
            if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }

            return objectMapper.readValue(text, new TypeReference<List<NoteResponse>>() {});
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
