import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [RouterModule, ButtonModule, ToggleSwitchModule, FormsModule, CommonModule],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss'
})
export class NavigationBarComponent {
  isDarkMode: boolean = false;

  toggleDarkMode(event: boolean) {
    this.isDarkMode = event;
    const element = document.querySelector('html');
    element!.classList.toggle('darkmode', this.isDarkMode);
  }
}
