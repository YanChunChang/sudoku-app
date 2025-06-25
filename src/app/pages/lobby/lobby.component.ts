import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [ButtonModule, CommonModule, FormsModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  roomId = '';

  createRoom() {
    // Logic to create a room
    console.log('Creating room with ID:', this.roomId);
  }

  joinRoom() {
    // Logic to join a room
    console.log('Joining room with ID:', this.roomId);
  }
}
