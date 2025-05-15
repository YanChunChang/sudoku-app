import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private translate: TranslateService) {
   }

  languageOptions: { code: string; label: string }[] = [];
  translatedThemeOptions: { value: string, label: string }[] = [];

  getTranslatedThemeOptions() {
    this.translatedThemeOptions = [
      { value: 'light', label: this.translate.instant('SETTINGS.THEME.LIGHT')},
      { value: 'dark', label: this.translate.instant('SETTINGS.THEME.DARK')},
      { value: 'system', label: this.translate.instant('SETTINGS.THEME.SYSTEM')},
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
    document.documentElement.lang = lang;
    this.translate.use(lang).subscribe(() => {
      this.getTranslatedThemeOptions();
    });
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }
}
