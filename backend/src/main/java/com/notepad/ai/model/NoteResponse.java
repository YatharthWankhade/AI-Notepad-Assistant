package com.notepad.ai.model;

import java.util.List;

public class NoteResponse {
    private String originalPoint;
    private String title;
    private List<String> solution;
    private List<String> tags;

    public NoteResponse() {}

    public NoteResponse(String originalPoint, String title, List<String> solution, List<String> tags) {
        this.originalPoint = originalPoint;
        this.title = title;
        this.solution = solution;
        this.tags = tags;
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

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
