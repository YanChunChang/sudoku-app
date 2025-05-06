import { Injectable } from '@angular/core';
import { getSudoku } from 'sudoku-gen';

@Injectable({
  providedIn: 'root'
})
export class SudokuService {
  initialBoard: number[][] = [];
  solvedBoard: number[][] = [];
  
  sudokuEasy = getSudoku('easy');

  constructor() {
        console.log(this.sudokuEasy);
  }
}
