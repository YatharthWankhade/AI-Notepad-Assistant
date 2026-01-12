package com.notepad.ai.model;

public class NoteRequest {
    private Long id;
    private String content;

    public NoteRequest() {}

    public NoteRequest(String content) {
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
