import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private translate: TranslateService) {
   }

  languageOptions = [
    { code: 'zh-tw', label: '繁體中文' },
    { code: 'de', label: 'Deutsch' },
    { code: 'jp', label: '日本語' },
    { code: 'en', label: 'English' }
  ];

  translatedThemeOptions: { value: string, label: string }[] = [];

  initTranslatedThemeOptions() {
    this.translatedThemeOptions = [
      { value: 'light', label: this.translate.instant('SETTINGS.THEME.LIGHT')},
      { value: 'dark', label: this.translate.instant('SETTINGS.THEME.DARK')},
      { value: 'system', label: this.translate.instant('SETTINGS.THEME.SYSTEM')},
    ];
  }

  setLanguage(lang: string) {
    document.documentElement.lang = lang;
    this.translate.use(lang).subscribe(() => {
      this.initTranslatedThemeOptions();
    });
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }
}
