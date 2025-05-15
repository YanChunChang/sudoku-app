import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme/theme.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [RouterModule, ButtonModule, ToggleSwitchModule, FormsModule, CommonModule, TranslateModule],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss'
})
export class NavigationBarComponent {
  isDarkMode: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private themeService: ThemeService) {
  }

  ngOnInit() {
    this.subscription = this.themeService.darkMode$.subscribe(mode => {
      this.isDarkMode = mode;
    });
  }

  toggleDarkMode(event: boolean) {
    this.themeService.toggleDarkMode(event);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
