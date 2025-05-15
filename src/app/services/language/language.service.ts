import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.setLanguage(savedLang);
      console.log('Language set from localStorage:', savedLang);
    } else {
      const browserLang = this.translate.getBrowserLang();

      let selectedLang: string;

      switch (browserLang) {
        case 'zh':
          selectedLang = 'zh-tw';
          break;
        case 'ja':
          selectedLang = 'jp';
          break;
        case 'de':
        case 'en':
          selectedLang = browserLang;
          break;
        default:
          selectedLang = 'en';
      }

      this.setLanguage(selectedLang);
      console.log('Language set from browser:', selectedLang);
    }
  }

  languageOptions: { code: string; label: string }[] = [];
  translatedThemeOptions: { value: string, label: string }[] = [];

  getTranslatedThemeOptions() {
    this.translatedThemeOptions = [
      { value: 'light', label: this.translate.instant('SETTINGS.THEME.LIGHT') },
      { value: 'dark', label: this.translate.instant('SETTINGS.THEME.DARK') },
      { value: 'system', label: this.translate.instant('SETTINGS.THEME.SYSTEM') },
    ];
  }

  getLanguageOptions() {
    this.languageOptions = [
      { code: 'zh-tw', label: this.translate.instant('SETTINGS.LANGUAGE.CHINESE') },
      { code: 'de', label: this.translate.instant('SETTINGS.LANGUAGE.GERMAN') },
      { code: 'jp', label: this.translate.instant('SETTINGS.LANGUAGE.JAPANESE') },
      { code: 'en', label: this.translate.instant('SETTINGS.LANGUAGE.ENGLISH') }
    ];
  }

  setLanguage(lang: string) {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    this.translate.use(lang).subscribe(() => {
      this.getTranslatedThemeOptions();
    });
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }
}
