import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GameStateService } from './game-state.service';
import { SudokuService } from '../sudoku.service';
import { LocalTimerService } from '../timer/local-timer.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(
    private gameStateService: GameStateService, 
    private fb: FormBuilder,
    private sudokuService: SudokuService,
    private localTimerService: LocalTimerService) { }

  setupGameBoard(currentLevel: string, currentTimerKey: string, testMode = false): { form: FormGroup, initialBoard: number[][], solvedBoard: number[][], userBoard: (number | null)[][], loadStorage: boolean } {
    const savedTimerKey = localStorage.getItem('timerKey');
    const loadStorage = savedTimerKey === currentTimerKey && !testMode;
    console.log('savedTimerKey:', savedTimerKey);
    console.log('loadStorage:', loadStorage);

    let initialBoard: number[][];
    let solvedBoard: number[][];
    let userBoard: (number | null)[][];

    if (loadStorage) {
      this.gameStateService.initializeInitialBoardFromLocalStorage();
      this.gameStateService.initializeSolvedBoardFromLocalStorage();
      initialBoard = this.gameStateService.getInitialBoard();
      solvedBoard = this.gameStateService.getSolvedBoard();

      //user board from localStorage
      const saveduserBoardString = localStorage.getItem('userBoard');
      if (saveduserBoardString) {
        try {
          userBoard = JSON.parse(saveduserBoardString) as number[][];
        } catch (error) {
          userBoard = initialBoard.map(row => row.map(cell => cell === 0 ? null : cell));
        }
      } else {
        userBoard = initialBoard.map(row => row.map(cell => cell === 0 ? null : cell));
      }

    } else if (testMode) {
      // test board
      initialBoard = this.TEST_BOARD_INITIAL;
      solvedBoard = this.TEST_BOARD_SOLVED;

      this.gameStateService.setInitialBoard(initialBoard);
      this.gameStateService.setSolvedBoard(solvedBoard);

      initialBoard = this.gameStateService.getInitialBoard();
      solvedBoard = this.gameStateService.getSolvedBoard();

      localStorage.removeItem('userBoard');

      userBoard = initialBoard.map(row => row.map(cell => cell === 0 ? null : cell));
    } else {
      // Generate new board
      localStorage.setItem('timerKey', currentTimerKey);
      this.sudokuService.generateSudoku(currentLevel);
      this.gameStateService.setInitialBoard(this.sudokuService.initialBoard);
      this.gameStateService.setSolvedBoard(this.sudokuService.solvedBoard);

      initialBoard = this.gameStateService.getInitialBoard();
      solvedBoard = this.gameStateService.getSolvedBoard();

      localStorage.removeItem('userBoard');
      userBoard = initialBoard.map(row => row.map(cell => cell === 0 ? null : cell));
    
    }

    const boardForm = this.fb.group({
      board: this.fb.array(this.createBoard(initialBoard, userBoard))
    });

    return { form: boardForm, initialBoard, solvedBoard, userBoard, loadStorage };
  }

  //initialboard has value 0, in formcontrol 0 is present as null to show space in html
  createBoard(initialBoard: number[][], userBoard: (number | null)[][]): FormArray[] {
    const board: FormArray[] = [];
    for (let i = 0; i < 9; i++) {
      const row: FormArray = this.fb.array([]);
      for (let j = 0; j < 9; j++) {
        const value = initialBoard[i][j];
        const userValue = userBoard[i][j];
        let cell!: FormControl;
        if (value !== 0) {
          // Original value from initialBoard → fixed (readonly)
          cell = this.fb.control(value);
        } else {
          // Editable cell → load userValue or null
          cell = this.fb.control(userValue, [Validators.pattern(/[1-9]/)]);
        }
        row.push(cell);
      }
      board.push(row);
    }
    return board;
  }

  //fetch single value from the 2d array
  getCell(form: FormGroup, row: number, col: number): FormControl {
    const board = form.get('board') as FormArray;
    return (board.at(row) as FormArray).at(col) as FormControl;
  }

  checkCellAnswer(form: FormGroup, row: number, col: number): boolean {
    const savedSolvedBoard = this.gameStateService.getSolvedBoard();

    const userValue = this.getCell(form, row, col).value;
    const correctValue = savedSolvedBoard[row][col];

    if (userValue === null || userValue === '' || isNaN(Number(userValue))) {
      return false;
    }

    return Number(userValue) === correctValue;
  }

  isSudokuCompleted(form: FormGroup): boolean {

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!this.checkCellAnswer(form, row, col)) {
          return false;
        }
      }
    }

    this.localTimerService.stop(true);
    return true
  }

  resetUserBoard(form: FormGroup, initialBoard: number[][]): void {
    const board = form.get('board') as FormArray;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = (board.at(row) as FormArray).at(col) as FormControl;
        const originalValue = initialBoard[row][col];
        cell.setValue(originalValue === 0 ? null : originalValue);
      }
    }
  }

  TEST_BOARD_INITIAL: number[][] = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 0]
  ];

  TEST_BOARD_SOLVED: number[][] = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5 ,2 ,8 ,6 ,1 ,7 ,9]
   ];

   private toEmptyBoard(initialBoard: number[][]): (number | null)[][] {
     return initialBoard.map(row => row.map(cell => cell === 0 ? null : cell));
   }
}
