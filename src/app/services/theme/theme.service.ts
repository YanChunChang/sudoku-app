import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();
  private themeSubject = new BehaviorSubject<string>('light');
  theme$ = this.themeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }

  toggleDarkMode(isDarkMode: boolean) {
    const element = document.querySelector('html');
    element!.classList.toggle('darkmode', isDarkMode);
    this.darkModeSubject.next(isDarkMode);
    this.themeSubject.next(isDarkMode ? 'dark' : 'light');
  }

  // This method is used for setting page(p-select)
  setTheme(theme: string) {
    let isDarkMode = false;

    if (theme === 'dark') {
      isDarkMode = true;
    } else if (theme === 'light') {
      isDarkMode = false;
    } else {
      isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    localStorage.setItem('theme', theme);
    this.toggleDarkMode(isDarkMode);
    this.themeSubject.next(theme);
  }

  getCurrentSelectedTheme(): string {
    return this.themeSubject.getValue();
  }
}
