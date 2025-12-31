import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { NoteService } from './services/note.service';
import { NoteResponse } from './models/note.model';

interface NoteTab {
  id: number;
  title: string;
  content: string;
  results: NoteResponse[];
  isEditingTitle: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  tabs: NoteTab[] = [];
  activeTabId: number = 0;
  isLoading: boolean = false;

  private noteUpdateSubject = new Subject<{ id: number, content: string }>();

  constructor(private noteService: NoteService) {
    // Initialize with one tab
    this.addTab();
  }

  get activeTab(): NoteTab {
    return this.tabs.find(t => t.id === this.activeTabId) || this.tabs[0];
  }

  ngOnInit() {
    this.noteUpdateSubject.pipe(
      debounceTime(1500),
      // We map to the inner observable but need to handle concurrency correctly
      switchMap(data => {
        this.isLoading = true;
        if (!data.content.trim()) {
          this.isLoading = false;
          // Update the specific tab to empty results
          this.updateTabResults(data.id, []);
          return [];
        }
        // Return an observable that includes the tab ID context
        return this.noteService.analyzeNotes(data.content).pipe(
          map(results => ({
            id: data.id,
            results: results
          }))
        );
      })
    ).subscribe({
      next: (response: any) => {
        // If response is array (empty case handling)
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

  updateTabResults(id: number, results: NoteResponse[]) {
    const tab = this.tabs.find(t => t.id === id);
    if (tab) {
      tab.results = results;
    }
  }

  onNoteChange(content: string) {
    // Update active tab content instantly
    this.activeTab.content = content;
    // Trigger analysis
    this.noteUpdateSubject.next({
      id: this.activeTabId,
      content: content
    });
  }

  // --- Tab Management ---

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
    event.stopPropagation(); // Prevent selecting the tab while closing
    if (this.tabs.length === 1) return; // Don't close the last tab

    this.tabs = this.tabs.filter(t => t.id !== id);
    if (this.activeTabId === id) {
      this.activeTabId = this.tabs[0].id; // Switch to first available
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
}
