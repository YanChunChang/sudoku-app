import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: string = 'light';
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    this.currentTheme = savedTheme || 'light';
    this.toggleDarkMode(this.currentTheme === 'dark');
  }

  toggleDarkMode(isDarkMode: boolean) {
    if (isDarkMode) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
    const element = document.querySelector('html');
    element!.classList.toggle('darkmode', isDarkMode);
    this.darkModeSubject.next(isDarkMode);
  }

  // This method is used for setting page(p-select)
  setTheme(theme: string) {
    this.currentTheme = theme;
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
  }

  getCurrentSelectedTheme(): string {
    return this.currentTheme;
  }
}
