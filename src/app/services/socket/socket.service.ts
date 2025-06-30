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

  sendCellUpdate(roomId:string, i: number, j: number, newValue: number) {
    if (this.socket) {
      this.socket.emit('cell-update', {
        roomId: roomId,
        row: i,
        col: j,
        value: newValue
      });
    }
  } 

  onReceiveCellUpdate(callback: (row: number, col: number, value: number) => void){
    this.socket.on('cell-update', ({ row, col, value }) => {
      callback(row, col, value);
    });
  }

  sendCellFocus(roomId: string, username: string, row: number, col: number) {
    this.socket.emit('cell-focus', { roomId, username, row, col });
  }

  onReceiveFocusUpdate(callback: (username: string, row: number, col: number) => void) {
    this.socket.on('cell-focus-update', ({ username, row, col }) => {
      callback(username, row, col);
    });
  }

  sendMousePosition(roomId: string, userId: string, username: string, x: number, y: number) {
    this.socket.emit('mouse-position', { roomId, userId, username, x, y });
  }

  onReceiveMousePosition(callback: (data: { userId: string, username: string, x: number, y: number }) => void) {
    this.socket.on('mouse-update', callback);
  }

  onPlayerLeft(callback: (username: string, userId: string) => void) {
    this.socket.on('player-left', ({ username, userId }) => {
      callback(username, userId);
    });
  }

  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }

  disconnect(){
    this.socket.disconnect();
  }
}
