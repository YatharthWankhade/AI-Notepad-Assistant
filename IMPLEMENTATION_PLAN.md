# Implementation Plan - AI Notepad Assistant

## Goal Description
Build a production-ready AI Notepad Assistant where users can jot down points and get real-time AI-generated structured solutions. The system includes a Java 21 Spring Boot backend and an Angular frontend with a split-pane UI.

## User Review Required
> [!IMPORTANT]
> **AI Integation**: The system requires an OpenAI or Anthropic API Key. I will implement a configuration property `ai.api.key` and a mock mode if the key is missing or for development.

## Proposed Changes

### Project Structure
Root: `AI-Notepad-Assistant/`
- `backend/` (Spring Boot)
- `frontend/` (Angular)

### Backend (Spring Boot)
#### [NEW] [pom.xml](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/pom.xml)
- Dependencies: `spring-boot-starter-web`, `spring-boot-starter-validation`, `lombok`, `spring-boot-starter-test`.

#### [NEW] [Application.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/AiNotepadApplication.java)
- Main entry point.

#### [NEW] [NoteController.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/controller/NoteController.java)
- `POST /api/notes/analyze`

#### [NEW] [NoteService.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/service/NoteService.java)
- Orchestrates splitting and AI calls.

#### [NEW] [NoteSplitter.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/service/NoteSplitter.java)
- Splitting logic (newline, bullets).

#### [NEW] [AiClient.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/client/AiClient.java)
- Interface for AI provider (Claude/GPT).
- Implementation: `OpenAiClient` (or generic HTTP client) + `MockAiClient`.

### Frontend (Angular)
#### [NEW] [app.component.html](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/frontend/src/app/app.component.html)
- Split pane layout.

#### [NEW] [note.service.ts](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/frontend/src/app/services/note.service.ts)
- HTTP calls to backend.

#### [NEW] [editor.component.ts](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/frontend/src/app/components/editor/editor.component.ts)
- Textarea with debounce.

## Verification Plan

### Automated Tests
- Backend: JUnit tests for `NoteSplitter` and `NoteService`.
- Frontend: Angular unit tests for components.

### Manual Verification
- Run backend: `mvn spring-boot:run`
- Run frontend: `npm start`
- Type notes in the editor and verify AI responses appear in the right pane.

## LLM Integration Plan (OpenAI & Gemini)

### Backend Changes

#### [NEW] [OpenAiClient.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/client/OpenAiClient.java)
- Implement `AiClient` interface.
- Use `RestClient` to call OpenAI API.
- Prompt engineering to enforce JSON schema matching `NoteResponse`.

#### [NEW] [GeminiClient.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/client/GeminiClient.java)
- Implement `AiClient` interface.
- Use `RestClient` to call Google Gemini API (`generativelanguage.googleapis.com`).
- Handle Gemini specific request/response structure.

#### [MODIFY] [application.properties](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/resources/application.properties)
- Add `ai.api.key`.
- Add `ai.model` (default: gpt-3.5-turbo).
- Add `ai.provider` options (mock, openai, gemini).

#### [MODIFY] [AiClient Config](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/client/AiClientConfig.java)
- Create configuration to select between `OpenAiClient`, `GeminiClient`, and `MockAiClient` based on property `ai.provider`.

## Optimization Plan

### Smart Grouping & Analysis (Refactor)
To enable "smart grouping" and solve rate limits:
#### [MODIFY] [AiClient Interface](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/client/AiClient.java)
- Change `analyze(String)` to return `List<NoteResponse>`.

#### [MODIFY] [GeminiClient.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/client/GeminiClient.java)
- Update prompt to ask for "JSON Array" of results.
- Parse JSON Array into `List<NoteResponse>`.
- Remove manual rate limiting (as we make only 1 request per user action now).

#### [MODIFY] [NoteService.java](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/backend/src/main/java/com/notepad/ai/service/NoteService.java)
- Remove `NoteSplitter` logic.
- Pass full content to `AiClient`.

### Multi-Tab Support
To allow parallel note taking:
#### [MODIFY] [AppComponent](file:///Users/yatharthwankhade/Developer/AI-Notepad-Assistant/frontend/src/app/app.component.ts)
- Implement `NoteTab` interface (`id`, `content`, `results`).
- Manage array of tabs.
- Add UI for Tab Bar (Add, Rename, Close).
