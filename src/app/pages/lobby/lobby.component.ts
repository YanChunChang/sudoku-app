import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SocketService } from '../../services/socket/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GameStateService } from '../../services/game/game-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [ButtonModule, CommonModule, FormsModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  private destroy$ = new Subject<void>();
  roomId = '';
  currentUsername = '';
  currentPlayMode = '';
  currentPlayerMode = '';
  currentLevel = '';

  constructor(
    private socketService: SocketService, 
    private router: Router,
    private route: ActivatedRoute,
    private gameStateService: GameStateService,) { }

  ngOnInit() {

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.gameStateService.setPlayerMode(params.get('single') ?? 'multi');
      this.gameStateService.setPlayMode(params.get('playmode') ?? 'normal');
      this.gameStateService.setLevel(params.get('level') ?? 'easy');

      this.currentPlayerMode = this.gameStateService.getCurrentPlayerMode();
      this.currentPlayMode = this.gameStateService.getCurrentPlayMode();
      this.currentLevel = this.gameStateService.getCurrentLevel();
    });

    this.socketService.connect();

    this.socketService.onJoinedRoom((res) => {
      if (res.success) {
        console.log("Joined room!");
      } else {
        alert(res.reason);
      }
    });

    this.socketService.onStartGame(() => {
      this.router.navigate(['/sudoku', this.currentPlayerMode, this.currentPlayMode, 
        this.currentLevel, this.roomId]);
    });
  }

  createRoom() {
    this.roomId = this.generateRoomId();
    console.log('Creating room with ID:', this.roomId);
  }

  joinRoom() {
    console.log('Joining room with ID:', this.roomId);
    if (!this.roomId) return;
    this.socketService.joinRoom(this.roomId, this.currentLevel);
  }

  generateRoomId(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  ngOnDestroy() {

  }
}
