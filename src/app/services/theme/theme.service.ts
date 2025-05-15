import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: string = 'light';

  toggleDarkMode(isDarkMode: boolean) {
    const element = document.querySelector('html');
    element!.classList.toggle('darkmode', isDarkMode);
  }

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

    this.toggleDarkMode(isDarkMode);
  }

  getCurrentSelectedTheme(): string {
    return this.currentTheme;
  }
}
