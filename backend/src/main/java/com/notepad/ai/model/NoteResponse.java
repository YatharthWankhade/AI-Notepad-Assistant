package com.notepad.ai.model;

import java.util.List;

public class NoteResponse {
    private String originalPoint;
    private String title;
    private List<String> solution;

    public NoteResponse() {}

    public NoteResponse(String originalPoint, String title, List<String> solution) {
        this.originalPoint = originalPoint;
        this.title = title;
        this.solution = solution;
    }

    public String getOriginalPoint() {
        return originalPoint;
    }

    public void setOriginalPoint(String originalPoint) {
        this.originalPoint = originalPoint;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getSolution() {
        return solution;
    }

    public void setSolution(List<String> solution) {
        this.solution = solution;
    }
}
