import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  languageOptions = [
  { code: 'zh-tw', label: '繁體中文' },
  { code: 'de', label: 'Deutsch' },
  { code: 'jp', label: '日本語' },
  { code: 'en', label: 'English' }
];

  constructor(private translate: TranslateService) { }

  setLanguage(lang: string) {
    document.documentElement.lang = lang;
    this.translate.use(lang);
  }
}
