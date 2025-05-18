import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../../services/theme/theme.service';
import { LanguageService } from '../../../services/language/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule, RouterModule, FormsModule, SelectModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  selectedTheme: string = 'light';
  selectedLanguage: string = 'de';
  private subscriptions = new Subscription();

  constructor(
    private router: Router, 
    private languageService: LanguageService, 
    private themeService: ThemeService,
  ) {
  }

  ngOnInit() {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
    this.themeService.theme$.subscribe(theme => {
      this.selectedTheme = theme;
    });
  }

  onBackToStart(){
    this.router.navigate(['/sudoku']);
  }
  
  themeOptions(): { value: string; label: string}[] {
    this.languageService.getTranslatedThemeOptions();
    return this.languageService.translatedThemeOptions;
  }

  languageOptions(): { code: string; label: string }[] {
    this.languageService.getLanguageOptions();
    return this.languageService.languageOptions;
  }

  setLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.languageService.setLanguage(lang);
  }
  
  setTheme(theme: string) {
    this.selectedTheme = theme;
    this.themeService.setTheme(theme);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
