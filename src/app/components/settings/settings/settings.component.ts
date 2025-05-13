import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../../services/language/language.service';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule, RouterModule, DropdownModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  selectedTheme: string = 'system';
  selectedLanguage: string = 'de';

  constructor(
    private router: Router, 
    private LanguageService: LanguageService,  
  ) {}

  onBackToStart(){
    this.router.navigate(['/sudoku']);
  }
  
  themeOptions = [
    { value: 'light', label: 'SETTINGS.THEME.LIGHT' },
    { value: 'dark', label: 'SETTINGS.THEME.DARK' },
    { value: 'default', label: 'SETTINGS.THEME.SYSTEM'}
  ];

  languageOptions(): { code: string; label: string }[] {
    return this.LanguageService.languageOptions;
  }
  
  setLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.LanguageService.setLanguage(lang);
  }
  
  setTheme(theme: string) {
    this.selectedTheme = theme;
    //this..setTheme(theme); // 你可實作這個 service
  }
  


}
