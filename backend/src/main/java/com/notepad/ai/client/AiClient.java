package com.notepad.ai.client;

import com.notepad.ai.model.NoteResponse;

public interface AiClient {
    java.util.List<NoteResponse> analyze(String noteContent);
}
