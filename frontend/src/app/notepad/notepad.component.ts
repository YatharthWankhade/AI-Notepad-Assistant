import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { NoteService } from '../services/note.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { ToastService } from '../services/toast.service';
import { Router, RouterModule } from '@angular/router';
import { NoteResponse } from '../models/note.model';



export interface NoteTab {
  id: number;
  title: string;
  content: string;
  results: NoteResponse[];
  category?: string;
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

  groupedNotes: { [key: string]: NoteTab[] } = {};
  categories: string[] = [];
  searchTerm: string = '';
  isSidebarCollapsed: boolean = false;

  private noteUpdateSubject = new Subject<{ id: number, content: string }>();
  private autoSaveSubject = new Subject<{ id: number, content: string }>();
  private autoAnalyzeSubject = new Subject<string>();

  constructor(
    private noteService: NoteService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
    private toastService: ToastService
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

    // Auto-Analyze Logic (Debounced 3s)
    this.autoAnalyzeSubject.pipe(
      debounceTime(3000),
      distinctUntilChanged()
    ).subscribe(content => {
      if (content && content.trim().length > 10) { // Only analyze if there's substantial content
        console.log('Auto-analyzing...');
        this.analyzeCurrentNote(true); // true = silent/auto mode indicator if needed
      }
    });

    // Autosave Logic (Silent)
    this.autoSaveSubject.pipe(
      debounceTime(2000),
      switchMap(data => {
        if (!data.content.trim()) return [];
        // If it's a temp ID (timestamp), create new note. Else update.
        const isTempId = data.id > 10000000000;
        if (isTempId) {
          return this.noteService.saveNote(data.content).pipe(
            map(savedNote => ({ originalId: data.id, savedNote }))
          );
        } else {
          return this.noteService.updateNote(data.id, data.content).pipe(
            map(() => null)
          );
        }
      })
    ).subscribe({
      next: (result: any) => {
        if (result && result.savedNote) {
          // Update temp ID to real ID
          const tab = this.tabs.find(t => t.id === result.originalId);
          if (tab) {
            tab.id = result.savedNote.id;
            tab.title = result.savedNote.title;
            if (this.activeTabId === result.originalId) this.activeTabId = tab.id;
            this.groupTabs(); // Re-group with new data
          }
        }
        console.log('Autosaved');
      },
      error: (err) => console.error('Autosave failed', err)
    });
  }

  checkUserNotes() {
    if (this.user) {
      this.isLoading = true;
      this.noteService.getUserNotes().subscribe({
        next: (notes: any[]) => {
          this.isLoading = false;
          if (notes && notes.length > 0) {
            this.tabs = notes.map(n => ({
              id: n.id,
              title: n.title,
              content: n.content,
              results: n.aiResponseJson ? JSON.parse(n.aiResponseJson) : [],
              category: n.category || 'General',
              isEditingTitle: false,
              expandedCards: new Set<number>()
            }));
            this.activeTabId = this.tabs[0].id;
            this.groupTabs();
            this.toastService.show('Notes loaded successfully', 'success');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.show('Failed to load notes', 'error');
        }
      });
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
    // Trigger Autosave
    this.autoSaveSubject.next({
      id: this.activeTabId,
      content: content
    });
    // Trigger Auto-Analyze
    this.autoAnalyzeSubject.next(content);
  }

  analyzeCurrentNote(isAuto: boolean = false) {
    if (!this.activeTab.content.trim()) return;

    // If auto-analyzing, we might want to skip if already loading or too short
    if (this.isLoading && isAuto) return;

    this.isLoading = true;
    const realId = this.activeTab.id > 10000000000 ? undefined : this.activeTab.id;

    this.noteService.analyzeNotes(this.activeTab.content, realId).subscribe({
      next: (results) => {
        this.activeTab.results = results;
        this.isLoading = false;
        if (!isAuto) {
          this.toastService.show('Analysis complete', 'success');
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (!isAuto) {
          this.toastService.show('Analysis failed', 'error');
        }
      }
    });
  }

  saveCurrentNote() {
    const tab = this.activeTab;
    this.noteService.updateNote(tab.id, tab.content).subscribe({
      next: () => this.toastService.show('Saved', 'success'),
      error: () => this.toastService.show('Save failed', 'error')
    });
  }

  organizeNotes() {
    this.isLoading = true;
    this.noteService.groupNotes().subscribe({
      next: (updatedNotes) => {
        this.checkUserNotes(); // Reload all to get new categories
        this.isLoading = false;
        this.toastService.show('Notes organized!', 'success');
      },
      error: () => {
        this.isLoading = false;
        this.toastService.show('Organization failed', 'error');
      }
    });
  }

  groupTabs() {
    this.groupedNotes = {};
    this.tabs.forEach(tab => {
      const cat = tab.category || 'General';
      if (!this.groupedNotes[cat]) this.groupedNotes[cat] = [];
      this.groupedNotes[cat].push(tab);
    });
    this.categories = Object.keys(this.groupedNotes).sort();
  }

  getFilteredNotes(category: string): NoteTab[] {
    let notes = this.groupedNotes[category] || [];
    if (this.searchTerm) {
      const lower = this.searchTerm.toLowerCase();
      notes = notes.filter(n => n.title.toLowerCase().includes(lower) || n.content.toLowerCase().includes(lower));
    }
    return notes;
  }

  addTab() {
    const newId = Date.now();
    this.tabs.push({
      id: newId,
      title: `Note ${this.tabs.length + 1}`,
      content: '',
      results: [],
      category: 'General',
      isEditingTitle: false,
      expandedCards: new Set<number>()
    });
    this.activeTabId = newId;
    this.groupTabs();
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
      this.toastService.show('Copied to clipboard!', 'success');
    } catch (err) {
      this.toastService.show('Failed to copy', 'error');
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

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  appendToNote(text: string) {
    if (!this.activeTab) return;

    // Clean up text
    text = text.trim();
    if (!text) return;

    // Capitalize first letter if needed
    text = text.charAt(0).toUpperCase() + text.slice(1);

    const currentContent = this.activeTab.content || '';
    // Add space if needed
    const separator = currentContent.length > 0 && !currentContent.match(/\s$/) ? ' ' : '';
    const newContent = currentContent + separator + text;

    this.activeTab.content = newContent;
    // Trigger update
    this.onNoteChange(newContent);
  }
}
