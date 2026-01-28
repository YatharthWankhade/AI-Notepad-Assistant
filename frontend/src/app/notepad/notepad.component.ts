import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { NoteService } from '../services/note.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Router, RouterModule } from '@angular/router';
import { NoteResponse } from '../models/note.model';

interface NoteTab {
  id: number;
  title: string;
  content: string;
  results: NoteResponse[];
  isEditingTitle: boolean;
  expandedCards: Set<number>;
}

@Component({
  selector: 'app-notepad',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './notepad.component.html',
  styleUrls: ['./notepad.component.css']
})
export class NotepadComponent implements OnInit {
  tabs: NoteTab[] = [];
  activeTabId: number = 0;
  isLoading: boolean = false;
  user: any = null;
  isDarkMode: boolean = false;
  showCommandPalette: boolean = false;

  private noteUpdateSubject = new Subject<{ id: number, content: string }>();

  constructor(
    private noteService: NoteService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.addTab();
  }

  get activeTab(): NoteTab {
    return this.tabs.find(t => t.id === this.activeTabId) || this.tabs[0];
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.checkUserNotes();
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

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
              isEditingTitle: false,
              expandedCards: new Set<number>()
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
      isEditingTitle: false,
      expandedCards: new Set<number>()
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
    this.user = null;
    this.router.navigate(['/']);
  }

  // Dark Mode Toggle
  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }

  // Word and Character Count
  getWordCount(): number {
    if (!this.activeTab?.content) return 0;
    return this.activeTab.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  getCharCount(): number {
    return this.activeTab?.content?.length || 0;
  }

  // Copy to Clipboard
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  copySolution(result: NoteResponse): void {
    const text = `${result.title}\n\n${result.solution.join('\n')}`;
    this.copyToClipboard(text);
  }

  // Card Expansion
  toggleCardExpansion(cardIndex: number): void {
    if (!this.activeTab) return;
    if (this.activeTab.expandedCards.has(cardIndex)) {
      this.activeTab.expandedCards.delete(cardIndex);
    } else {
      this.activeTab.expandedCards.add(cardIndex);
    }
  }

  isCardExpanded(cardIndex: number): boolean {
    return this.activeTab?.expandedCards?.has(cardIndex) || false;
  }

  // Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl/Cmd + K: Command Palette
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.showCommandPalette = !this.showCommandPalette;
    }

    // Ctrl/Cmd + N: New Note
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      this.addTab();
    }

    // Ctrl/Cmd + 1-9: Switch Tabs
    if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      const index = parseInt(event.key) - 1;
      if (index < this.tabs.length) {
        this.activeTabId = this.tabs[index].id;
      }
    }

    // Escape: Close Command Palette
    if (event.key === 'Escape') {
      this.showCommandPalette = false;
    }
  }

  executeCommand(command: string): void {
    switch (command) {
      case 'new-note':
        this.addTab();
        break;
      case 'toggle-theme':
        this.toggleDarkMode();
        break;
      case 'logout':
        this.logout();
        break;
    }
    this.showCommandPalette = false;
  }
}
