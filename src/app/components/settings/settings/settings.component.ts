import { Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  showLangMenu = false;

  languages = ['zh-tw', 'en', 'jp', 'de'];

  langLabels: Record<string, string> = {
    'zh-tw': '繁體中文',
    'en': 'English',
    'jp': '日本語',
    'de': 'Deutsch'
  };

  constructor(private translate: TranslateService, private route: ActivatedRoute, private router: Router, ) {}

  toggleLanguageMenu() {
    this.showLangMenu = !this.showLangMenu;
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.showLangMenu = false;
  }


  onClicktToSetLanguage() {
    this.router.navigate(['/sudoku/language']);
  }

  onBackToStart(){
    this.router.navigate(['/sudoku']);
  }
}
