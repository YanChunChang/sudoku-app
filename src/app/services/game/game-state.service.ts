import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private playerModeSubject = new BehaviorSubject<string>('single');
  playerMode$ = this.playerModeSubject.asObservable();

  private playModeSubject = new BehaviorSubject<string>('normal');
  playMode$ = this.playModeSubject.asObservable();

  private levelSubject = new BehaviorSubject<string>('easy');
  level$ = this.levelSubject.asObservable();

  private initialBoardSubject = new BehaviorSubject<number[][]>([]);
  initialBoard$ = this.initialBoardSubject.asObservable();

  private solvedBoardSubject = new BehaviorSubject<number[][]>([]);
  solvedBoard$ = this.solvedBoardSubject.asObservable();

  private timerKeySubject = new BehaviorSubject<string>('');
  timerKey$ = this.timerKeySubject.asObservable();

  // Setter
  setPlayerMode(playermode: string) {
    this.playerModeSubject.next(playermode);
  }

  setPlayMode(playmode: string) {
    this.playModeSubject.next(playmode);
  }

  setLevel(level: string) {
    this.levelSubject.next(level);
  }

  setTimerKey(timerKey: string) {
    this.timerKeySubject.next(timerKey);
  }

  setInitialBoard(initialBoard: number[][]) {
    this.initialBoardSubject.next(initialBoard);
    localStorage.setItem('initialBoard', JSON.stringify(initialBoard));
  }

  setSolvedBoard(solvedBoard: number[][]) {
    this.solvedBoardSubject.next(solvedBoard);
    localStorage.setItem('solvedBoard', JSON.stringify(solvedBoard));
  }

  // Getter
  getCurrentPlayerMode(): string {
    return this.playerModeSubject.getValue();
  }

  getCurrentPlayMode(): string {
    return this.playModeSubject.getValue();
  }

  getCurrentLevel(): string {
    return this.levelSubject.getValue();
  }

  getCurrentTimerKey(): string {
    return this.timerKeySubject.getValue();
  }

  getInitialBoard(): number[][] {
    return this.initialBoardSubject.getValue();
  }

  getSolvedBoard(): number[][] {
    return this.solvedBoardSubject.getValue();
  }


  //nitializer
  initializeInitialBoardFromLocalStorage() {
    const savedInitialBoardString = localStorage.getItem('initialBoard');
    if (savedInitialBoardString) {
      const savedBoard = JSON.parse(savedInitialBoardString) as number[][];
      this.initialBoardSubject.next(savedBoard);
    }
  }
  initializeSolvedBoardFromLocalStorage() {
    const savedSolvedBoardString = localStorage.getItem('solvedBoard');
    if (savedSolvedBoardString) {
      const savedBoard = JSON.parse(savedSolvedBoardString) as number[][];
      this.solvedBoardSubject.next(savedBoard);
    }
  }
}
