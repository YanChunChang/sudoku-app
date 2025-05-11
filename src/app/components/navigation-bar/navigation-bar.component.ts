import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [RouterModule, ButtonModule, ToggleButtonModule, ToggleSwitchModule, FormsModule],
  templateUrl: './navigation-bar.component.html',
  styleUrl: './navigation-bar.component.scss'
})
export class NavigationBarComponent {
  toggleDarkMode() {
    const element = document.querySelector('html');
    element!.classList.toggle('darkmode');
  }
}
