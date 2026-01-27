import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkModeSubject = new BehaviorSubject<boolean>(this.getInitialTheme());
    public darkMode$ = this.darkModeSubject.asObservable();

    constructor() {
        this.applyTheme(this.darkModeSubject.value);
    }

    private getInitialTheme(): boolean {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    toggleTheme(): void {
        const newTheme = !this.darkModeSubject.value;
        this.darkModeSubject.next(newTheme);
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }

    private applyTheme(isDark: boolean): void {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    isDarkMode(): boolean {
        return this.darkModeSubject.value;
    }
}
