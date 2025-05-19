import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from "./components/navigation-bar/navigation-bar.component";
import { BackendService } from './services/backend/backend.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sudoku-app';

  constructor(private backendService: BackendService) { }

  ngOnInit() {
    this.backendService.getBackendMessage().subscribe(
      (response) => {
        console.log('Backend response:', response);
      },
      (error) => {
        console.error('Error fetching backend message:', error);
      }
    );
  }
}
