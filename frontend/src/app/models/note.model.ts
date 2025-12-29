export interface NoteRequest {
    content: string;
}

export interface NoteResponse {
    originalPoint: string;
    title: string;
    solution: string[];
}
