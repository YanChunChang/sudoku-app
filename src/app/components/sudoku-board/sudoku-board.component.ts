import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SudokuService } from '../../services/sudoku.service';
import { TimerComponent } from "../timer/timer.component";
import { ButtonModule } from 'primeng/button';
import { Subject, takeUntil } from 'rxjs';
import { LocalTimerService } from '../../services/timer/local-timer.service';
import { GameConfigService } from '../../services/game/gameconfig.service';


@Component({
  selector: 'app-sudoku-board',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TimerComponent, ButtonModule],
  templateUrl: './sudoku-board.component.html',
  styleUrl: './sudoku-board.component.scss',
})
export class SudokuBoardComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  initialBoard!: number[][];
  solvedBoard!: number[][];
  currentLevel!: string | null;
  private destroy$ = new Subject<void>();
  timerMode: 'up' | 'down' = 'up';
  timerValue: number = 0;
  isPaused = false;

  constructor(
    private fb: FormBuilder,
    private sudokuService: SudokuService,
    private route: ActivatedRoute,
    private localTimerService: LocalTimerService,
    private gameConfigService: GameConfigService) {
  }

  ngOnInit() {
    // subscribe necessary for route changing
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const level = params.get('level');
      const mode = params.get('playmode') ?? 'normal';

      this.currentLevel = level;
      this.sudokuService.generateSudoku(level);
      this.initialBoard = this.sudokuService.initialBoard;
      this.solvedBoard = this.sudokuService.solvedBoard;

      this.timerMode = mode === 'countdown' ? 'down' : 'up';
      this.timerValue = mode === 'countdown' && level ? (this.gameConfigService.countdownTime.get(level) ?? 0) : 0;

      // wait util board loads
      const boardArray = this.createBoard();
      this.form = this.fb.group({
        board: this.fb.array(boardArray)
      });
    });

    this.localTimerService.isPausedObservable.subscribe(paused => {
      this.isPaused = paused;
    });

    //todo extra ui component for winning game
    this.form.valueChanges.subscribe(board => {
      if (this.isSudokuCompleted()) {
        setTimeout(() => {
          alert('🎉 恭喜你完成了整個數獨！');
        }, 100);
      }
    })
  }

  //initialboard has value 0, in formcontrol 0 is present as null to show space in html
  createBoard(): FormArray[] {
    const board: FormArray[] = [];
    for (let i = 0; i < 9; i++) {
      const row: FormArray = this.fb.array([]);
      for (let j = 0; j < 9; j++) {
        const value = this.initialBoard[i][j];
        const cell: FormControl = value === 0 ? this.fb.control(null, [Validators.required, Validators.pattern(/[1-9]/)]) : this.fb.control(value);
        row.push(cell);
      }
      board.push(row);
    }
    return board;
  }

  get board(): FormArray {
    return this.form.get('board') as FormArray;
  }

  get rowControls(): FormArray[] {
    return this.board.controls as FormArray[];
  }

  //fetch single value from the 2d array
  getCell(row: number, col: number): FormControl {
    return (this.board.at(row) as FormArray).at(col) as FormControl;
  }

  checkCellAnswer(row: number, col: number): boolean {
    const userValue = this.getCell(row, col).value;
    const correctValue = this.solvedBoard[row][col];

    if (userValue === null || userValue === '' || isNaN(Number(userValue))) {
      return false;
    }

    return Number(userValue) === correctValue;
  }

  getCellClass(row: number, col: number): string {
    const userValue = this.getCell(row, col).value;

    if (this.initialBoard[row][col] !== 0) {
      return ""
    } else if (userValue === null) {
      return ""
    } else {
      return this.checkCellAnswer(row, col) ? "correct" : "incorrect";
    }
  }

  isSudokuCompleted(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!this.checkCellAnswer(row, col)) {
          return false;
        }
      }
    }
    this.localTimerService.stop();
    return true
  }

  onClickReset() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const userValue = this.getCell(row, col);
        const userValueParsed = Number(userValue.value);
        let originalValue = this.initialBoard[row][col];
        if (originalValue === 0) {
          userValue.setValue(null);
        } else {
          userValue.setValue(originalValue);
        }
      }
    }
  }

  onClickNewgame() {
    this.sudokuService.generateSudoku(this.currentLevel);
    this.initialBoard = this.sudokuService.initialBoard;
    this.solvedBoard = this.sudokuService.solvedBoard;

    const boardArray = this.createBoard();
    this.form = this.fb.group({
      board: this.fb.array(boardArray)
    });
    this.localTimerService.reset();
    this.localTimerService.stop();
  }

  //Validator in Angular only check the value like e.g. control.invalid 
  //todo chinese still can be typed in cell because of composition event
  onKeyDown(event: KeyboardEvent, i: number, j: number) {
    const allowedKeys = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'];


    if (!allowedKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }

    let nextI = i;
    let nextJ = j;

    switch (event.key) {
      case 'ArrowUp':
        nextI = i > 0 ? i - 1 : i;
        break;
      case 'ArrowDown':
        nextI = i < 8 ? i + 1 : i;
        break;
      case 'ArrowLeft':
        nextJ = j > 0 ? j - 1 : j;
        break;
      case 'ArrowRight':
        nextJ = j < 8 ? j + 1 : j;
        break;
      default:
        return;
    }

    // Skip readonly cells
    let attempts = 0;
    while (attempts < 9) {
      const nextCell = document.getElementById(`cell-${nextI}-${nextJ}`) as HTMLInputElement;
      if (nextCell && !nextCell.readOnly) {
        nextCell.focus();
        event.preventDefault();
        return;
      }

      // Calculate the position of the next cell according to the arrow keys
      switch (event.key) {
        case 'ArrowUp':
          if (nextI > 0) nextI--;
          break;
        case 'ArrowDown':
          if (nextI < 8) nextI++;
          break;
        case 'ArrowLeft':
          if (nextJ > 0) nextJ--;
          break;
        case 'ArrowRight':
          if (nextJ < 8) nextJ++;
          break;
      }
      attempts++;
    }
  }

  onResume() {
    this.localTimerService.setPaused(false);
    this.localTimerService.start(this.timerMode, this.timerValue);
  }

  getBlockClass(i: number, j: number): 'a' | 'b' {
    const blockRow = Math.floor(i / 3);
    const blockCol = Math.floor(j / 3);
    return (blockRow + blockCol) % 2 === 0 ? 'a' : 'b';
  }

  ngOnDestroy(): void {
    this.destroy$.next(); //infrom all takeUntil to unsubscribe
    this.destroy$.complete(); //closing subject(destroy$)
    this.sudokuService.clearBoards();
  }

}
