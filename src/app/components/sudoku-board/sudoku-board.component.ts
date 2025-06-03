import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SudokuService } from '../../services/sudoku.service';
import { TimerComponent } from "../timer/timer.component";
import { ButtonModule } from 'primeng/button';
import { Subject, takeUntil } from 'rxjs';
import { LocalTimerService } from '../../services/timer/local-timer.service';
import { GameConfigService } from '../../services/game/gameconfig.service';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../services/leaderboard/leaderboard-service.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ScoreData } from '../../models/userData';


@Component({
  selector: 'app-sudoku-board',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TimerComponent, ButtonModule, DialogModule, TranslateModule, FormsModule, ToastModule],
  templateUrl: './sudoku-board.component.html',
  styleUrl: './sudoku-board.component.scss',
  providers: [MessageService]
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
  showGameWonDialog = false;
  showNicknameDialog = false;
  nickname: string = '';
  message = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private sudokuService: SudokuService,
    private route: ActivatedRoute,
    private router: Router,
    private localTimerService: LocalTimerService,
    private gameConfigService: GameConfigService,
    private leaderboardService: LeaderboardService,
    private translate: TranslateService,) {
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
      // Test Board (initialBoard)
      this.initialBoard = [
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

      // Solved Board (solvedBoard)
      this.solvedBoard = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];

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

    //for winning game
    this.form.valueChanges.subscribe(board => {
      if (this.isSudokuCompleted()) {
        setTimeout(() => {
          this.showNicknameDialog = true;
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

  submitScore() {
    const player = this.route.snapshot.paramMap.get('player')!;
    const playmode = this.route.snapshot.paramMap.get('playmode')!;
    const level = this.currentLevel!;
    const time = this.localTimerService.getCurrentTime();
    console.log(player, playmode, level, time)


    const scoreData: ScoreData = {
      nickname: this.nickname.trim(),
      playerMode: player,
      playMode: playmode,
      level: level,
      time: time,
      date: new Date().toISOString()
    };

    this.leaderboardService.submitScore(scoreData).subscribe({
      next: () => {
        console.log('Score submitted!');
        this.showNicknameDialog = false;
        this.nickname = '';
        this.showGameWonDialog = true;
      },
      error: (err) => {
        const messageKey = err.error.messageKey;
        this.error = this.translate.instant(err.error.messageKey);
        this.message = '';
      }
    });
  }

  onSkip(){
    this.showNicknameDialog = false;
    this.showGameWonDialog = true;
  }

  onClickReset() {
    if (this.isPaused) return;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const userValue = this.getCell(row, col);
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
  }

  onClickNextLevel() {

    if (this.currentLevel === 'easy') {
      this.currentLevel = 'medium';
    } else if (this.currentLevel === 'medium') {
      this.currentLevel = 'hard';
    } else if (this.currentLevel === 'hard') {
      this.currentLevel = 'expert';
    } else {
      this.currentLevel = 'easy';
    }

    this.router.navigate([
      '/sudoku',
      this.route.snapshot.paramMap.get('player'),
      this.route.snapshot.paramMap.get('playmode'),
      this.currentLevel
    ]);

    this.showGameWonDialog = false;
    this.localTimerService.reset();
  }

  onClickRandomGame() {
    const levels = ['easy', 'medium', 'hard', 'expert'];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];

    this.router.navigate([
      '/sudoku',
      this.route.snapshot.paramMap.get('player'),
      this.route.snapshot.paramMap.get('playmode'),
      randomLevel
    ]);
    this.localTimerService.reset();
    this.showGameWonDialog = false;
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
