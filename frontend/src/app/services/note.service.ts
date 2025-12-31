import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NoteResponse, NoteRequest } from '../models/note.model';

@Injectable({
    providedIn: 'root'
})
export class NoteService {
    private apiUrl = 'http://localhost:8080/api/notes';

    constructor(private http: HttpClient) { }

    analyzeNotes(content: string): Observable<NoteResponse[]> {
        const request: NoteRequest = { content };
        return this.http.post<NoteResponse[]>(`${this.apiUrl}/analyze`, request);
    }
}
