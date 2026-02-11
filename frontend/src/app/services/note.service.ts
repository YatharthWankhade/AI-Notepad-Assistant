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

    analyzeNotes(content: string, id?: number): Observable<NoteResponse[]> {
        const request: NoteRequest = { content, id };
        return this.http.post<NoteResponse[]>(`${this.apiUrl}/analyze`, request);
    }

    saveNote(content: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/save`, { content });
    }

    updateNote(id: number, content: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, { content });
    }

    groupNotes(): Observable<any[]> {
        return this.http.post<any[]>(`${this.apiUrl}/group`, {});
    }

    getUserNotes(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }
}
