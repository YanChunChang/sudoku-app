import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../../services/theme/theme.service';
import { LanguageService } from '../../../services/language/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule, RouterModule, FormsModule, SelectModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  selectedTheme: string = 'system';
  selectedLanguage: string = 'de';

  constructor(
    private router: Router, 
    private LanguageService: LanguageService, 
    private ThemeService: ThemeService 
  ) {
  }

  ngOnInit() {
    this.selectedLanguage = this.LanguageService.getCurrentLanguage();
    this.selectedTheme = this.ThemeService.getCurrentSelectedTheme();
  }

  onBackToStart(){
    this.router.navigate(['/sudoku']);
  }
  
  themeOptions(): { value: string}[] {
    this.LanguageService.initTranslatedThemeOptions();
    return this.LanguageService.translatedThemeOptions;
  }

  languageOptions(): { code: string; label: string }[] {
    return this.LanguageService.languageOptions;
  }

  setLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.LanguageService.setLanguage(lang);
  }
  
  setTheme(theme: string) {
    this.selectedTheme = theme;
    this.ThemeService.setTheme(theme);
  }

}
