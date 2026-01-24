import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { NoteService } from '../services/note.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NoteResponse } from '../models/note.model';

interface NoteTab {
  id: number;
  title: string;
  content: string;
  results: NoteResponse[];
  isEditingTitle: boolean;
}

@Component({
  selector: 'app-notepad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit {
  tabs: NoteTab[] = [];
  activeTabId: number = 0;
  isLoading: boolean = false;
  user: any = null;

  private noteUpdateSubject = new Subject<{ id: number, content: string }>();

  constructor(
    private noteService: NoteService,
    private authService: AuthService,
    private router: Router
  ) {
    this.addTab();
  }

  get activeTab(): NoteTab {
    return this.tabs.find(t => t.id === this.activeTabId) || this.tabs[0];
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.checkUserNotes();

    this.noteUpdateSubject.pipe(
      debounceTime(1500),
      switchMap(data => {
        this.isLoading = true;
        if (!data.content.trim()) {
          this.isLoading = false;
          this.updateTabResults(data.id, []);
          return [];
        }
        // Check if ID is a temporary timestamp (local only) or a real DB ID
        // DB IDs are usually small integers. Timestamps are huge.
        const realId = data.id > 10000000000 ? undefined : data.id;

        return this.noteService.analyzeNotes(data.content, realId).pipe(
          map(results => ({
            id: data.id,
            results: results
          }))
        );
      })
    ).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) return;
        this.updateTabResults(response.id, response.results);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error analyzing notes:', err);
        this.isLoading = false;
      }
    });
  }

  checkUserNotes() {
    if (this.user) {
      console.log('Fetching notes for user:', this.user.username);
      this.noteService.getUserNotes().subscribe({
        next: (notes: any[]) => {
          console.log('Notes received:', notes);
          if (notes && notes.length > 0) {
            this.tabs = notes.map(n => ({
              id: n.id,
              title: n.title,
              content: n.content,
              results: n.aiResponseJson ? JSON.parse(n.aiResponseJson) : [],
              isEditingTitle: false
            }));
            this.activeTabId = this.tabs[0].id;
          } else {
            console.log('No notes found for user.');
          }
        },
        error: (err) => console.error("Failed to load notes", err)
      });
    } else {
      console.log('No user logged in, skipping note fetch.');
    }
  }

  updateTabResults(id: number, results: NoteResponse[]) {
    const tab = this.tabs.find(t => t.id === id);
    if (tab) {
      tab.results = results;
    }
  }

  onNoteChange(content: string) {
    this.activeTab.content = content;
    this.noteUpdateSubject.next({
      id: this.activeTabId,
      content: content
    });
  }

  addTab() {
    const newId = Date.now();
    this.tabs.push({
      id: newId,
      title: `Note ${this.tabs.length + 1}`,
      content: '',
      results: [],
      isEditingTitle: false
    });
    this.activeTabId = newId;
  }

  selectTab(id: number) {
    this.activeTabId = id;
  }

  closeTab(event: Event, id: number) {
    event.stopPropagation();
    if (this.tabs.length === 1) return;

    this.tabs = this.tabs.filter(t => t.id !== id);
    if (this.activeTabId === id) {
      this.activeTabId = this.tabs[0].id;
    }
  }

  startRenaming(tab: NoteTab) {
    tab.isEditingTitle = true;
  }

  finishRenaming(tab: NoteTab) {
    tab.isEditingTitle = false;
    if (!tab.title.trim()) {
      tab.title = 'Untitled Note';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
