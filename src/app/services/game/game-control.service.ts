import { Injectable } from '@angular/core';
import { SudokuService } from '../sudoku.service';
import { GameStateService } from './game-state.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GameControlService {
  constructor(
    private sudokuService: SudokuService,
    private gameStateService: GameStateService,
    private router: Router
  ) { }

  startNewGame(currentLevel: string):{initialBoard: number[][], solvedBoard: number[][], userBoard: (number | null)[][]} {
    this.sudokuService.generateSudoku(currentLevel);
    this.gameStateService.setInitialBoard(this.sudokuService.initialBoard);
    this.gameStateService.setSolvedBoard(this.sudokuService.solvedBoard);

    const initialBoard = this.gameStateService.getInitialBoard();
    const solvedBoard = this.gameStateService.getSolvedBoard();

    localStorage.removeItem('userBoard');
    const userBoard = initialBoard.map(row => row.map(cell => cell === 0 ? null : cell));

    return {
      initialBoard: initialBoard,
      solvedBoard: solvedBoard,
      userBoard: userBoard
    };
  }

  goToNextLevel(currentLevel: string): string {
    if (currentLevel === 'easy') {
      currentLevel = 'medium';
    } else if (currentLevel === 'medium') {
      currentLevel = 'hard';
    } else if (currentLevel === 'hard') {
      currentLevel = 'expert';
    } else {
      currentLevel = 'easy';
    }
    return currentLevel;
  }

  startRandomGame(currentLevel: string): string {
    const levels = ['easy', 'medium', 'hard', 'expert'];
    let randomLevel = levels[Math.floor(Math.random() * levels.length)];

    //make sure that randomlevel will be changed 
    // -> better and avoid timer wont be resseted because ngOinit wont be reload if url doesnt change
    while (randomLevel === currentLevel) {
      randomLevel = levels[Math.floor(Math.random() * levels.length)];
    }

    return randomLevel;
  }

  goToLeaderboard(playerMode: string, playMode: string, level: string) {
    this.router.navigate(['/leaderboard'], {
      queryParams: {
        playerMode: playerMode,
        playMode: playMode,
        level: level,
        limit: 50
      }
    });
  }

  navigateToGame(playerMode: string, playMode: string, level: string) {
    this.router.navigate(['/sudoku', playerMode, playMode, level]);
  }
}
