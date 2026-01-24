export interface NoteRequest {
    id?: number;
    content: string;
}

export interface NoteResponse {
    originalPoint: string;
    title: string;
    solution: string[];
}
