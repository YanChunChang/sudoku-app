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

  // Setter
  setPlayerMode(playermode: string){
    this.playerModeSubject.next(playermode);
  }

  setPlayMode(playmode: string){
    this.playModeSubject.next(playmode);
  }

  setLevel(level: string){
    this.levelSubject.next(level);
  }

  setInitialBoard(initialBoard: number[][]){
    this.initialBoardSubject.next(initialBoard);
  }

  setSolvedBoard(solvedBoard: number[][]){
    this.solvedBoardSubject.next(solvedBoard);
  }

  // Getter
  getCurrentPlayerMode():string{
    return this.playerModeSubject.getValue();
  }
  
  getCurrentPlayMode():string{
    return this.playModeSubject.getValue();
  }

  getCurrentLevel():string{
    return this.levelSubject.getValue();
  }

  getInitialBoard():number[][]{
    return this.initialBoardSubject.getValue();
  }

  getSolvedBoard():number[][]{
    return this.solvedBoardSubject.getValue();
  }

}
