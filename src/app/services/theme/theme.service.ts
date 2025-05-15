import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: string = 'light';
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  toggleDarkMode(isDarkMode: boolean) {
    const element = document.querySelector('html');
    element!.classList.toggle('darkmode', isDarkMode);
    this.darkModeSubject.next(isDarkMode);
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
