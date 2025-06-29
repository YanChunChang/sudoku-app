import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private readonly socketUrl = 'http://localhost:3000';
  private boardSubject = new BehaviorSubject<{ initialBoard: number[][], solvedBoard: number[][] } | null>(null);
  public board$ = this.boardSubject.asObservable();

  constructor(private authService: AuthService) { }

  connect() {
    if (!this.socket) {
      this.socket = io(this.socketUrl);
    }
  }

  reconnect(roomId: string, userId: string, level: string, username: string) {
    console.log('Reconnecting mit:', { roomId, userId, level, username });
    this.socket = io(this.socketUrl, {
      query: {
        roomId,
        userId,
        level,
        username
      }
    });

    this.socket.on('sudokuboard', (board) => {
      console.log('📥 Board empfangen (in reconnect)', board);
      this.boardSubject.next(board);
    });
  }

  joinRoom(roomId: string, level: string) {
    const userId = this.authService.getUserId() ??'';
    const username = this.authService.getUsername() ??'';
    console.log(level)
    this.socket.emit('join-room', roomId, userId, level, username);
  }

  onJoinedRoom(callback: (response: { success: boolean, reason?: string }) => void) {
    this.socket.on('joined-room', callback);
  }

  onStartGame(callback: () => void) {
    this.socket.on('start-game', callback);
  }

  loadBoard() { 
    if (!this.socket) {
      this.connect();
      return;
    }
    console.log("testtest")
    this.socket.on('sudokuboard', (board: { initialBoard: number[][], solvedBoard: number[][] }) => {
      this.boardSubject.next(board);
    });
  }

  onPlayerLeft(callback: (username: string) => void) {
    this.socket.on('player-left', callback);
  }

  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }

  disconnect(){
    this.socket.disconnect();
  }
}
