import { Injectable } from '@angular/core';
import { getSudoku } from 'sudoku-gen';
import { SudokuDataParsed, SudokuDataRaw } from '../models/sudoku-data';

@Injectable({
  providedIn: 'root'
})
export class SudokuService {
  initialBoard: number[][] = [];
  solvedBoard: number[][] = [];

  constructor() {
  }

  generateSudoku(level: any): void {
    const sudokuDataRaw: SudokuDataRaw = getSudoku(level);
    const sudokuDataParsed: SudokuDataParsed =  this.parsedSudokuData(sudokuDataRaw);
    this.initialBoard = sudokuDataParsed.puzzle;
    this.solvedBoard = sudokuDataParsed.solution;
  }

  private parsedSudokuData(sudokuDataRaw: SudokuDataRaw): SudokuDataParsed {
    const parsedSudokuData = {
      puzzle: this.parseSudokuString(sudokuDataRaw.puzzle),
      solution: this.parseSudokuString(sudokuDataRaw.solution),
      difficulty: sudokuDataRaw.difficulty
    }
    return parsedSudokuData;
  }

  private parseSudokuString(sudokuString: string): number[][] {
    const sudokuArray: number[][] = [];
    for (let i = 0; i < 9; i++) {
      const row: number[] = [];
      for (let j = 0; j < 9; j++) {
        const index = i * 9 + j
        const char = sudokuString[index]
        row.push(char === '-' ? 0 : Number(char))
      }
      sudokuArray.push(row);
    }
    return sudokuArray;
  }

  clearBoards(): void {
    this.initialBoard = [];
    this.solvedBoard = [];
  }
}
