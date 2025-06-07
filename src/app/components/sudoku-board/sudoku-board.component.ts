import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SudokuService } from '../../services/sudoku.service';
import { TimerComponent } from "../timer/timer.component";
import { ButtonModule } from 'primeng/button';
import { filter, Subject, take, takeUntil } from 'rxjs';
import { LocalTimerService } from '../../services/timer/local-timer.service';
import { GameConfigService } from '../../services/game/gameconfig.service';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../services/leaderboard/leaderboard-service.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth/auth.service';
import { GameStateService } from '../../services/game/game-state.service';


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
  currentLevel = '';
  private destroy$ = new Subject<void>();
  timerMode: 'up' | 'down' = 'up';
  timerValue: number = 0;
  isPaused = false;
  showGameWonDialog = false;
  showNicknameDialog = false;
  nickname: string = '';
  message = '';
  error = '';
  isLoggedIn = false;
  currentUsername = '';
  currentPlayMode = '';
  currentPlayerMode = '';

  constructor(
    private fb: FormBuilder,
    private sudokuService: SudokuService,
    private route: ActivatedRoute,
    private router: Router,
    private localTimerService: LocalTimerService,
    private gameConfigService: GameConfigService,
    private leaderboardService: LeaderboardService,
    private translate: TranslateService,
    private authService: AuthService,
    private messageService: MessageService,
    private gameStateService: GameStateService) {
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUsername = this.authService.getUsername() ?? '';

    // subscribe necessary for route changing
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      // this.currentPlayerMode = params.get('playermode') ?? 'single';
      // this.currentLevel = params.get('level') ?? 'easy';
      // this.currentPlayMode = params.get('playmode') ?? 'normal';
      this.gameStateService.setPlayerMode(params.get('playermode') ?? 'single');
      this.gameStateService.setPlayMode(params.get('playmode') ?? 'normal');
      this.gameStateService.setLevel(params.get('level') ?? 'easy');

      this.currentPlayerMode = this.gameStateService.getCurrentPlayerMode();
      this.currentPlayMode = this.gameStateService.getCurrentPlayMode();
      this.currentLevel = this.gameStateService.getCurrentLevel();

      // Test Board (initialBoard)
      // this.initialBoard = [
      //   [5, 3, 4, 6, 7, 8, 9, 1, 2],
      //   [6, 7, 2, 1, 9, 5, 3, 4, 8],
      //   [1, 9, 8, 3, 4, 2, 5, 6, 7],
      //   [8, 5, 9, 7, 6, 1, 4, 2, 3],
      //   [4, 2, 6, 8, 5, 3, 7, 9, 1],
      //   [7, 1, 3, 9, 2, 4, 8, 5, 6],
      //   [9, 6, 1, 5, 3, 7, 2, 8, 4],
      //   [2, 8, 7, 4, 1, 9, 6, 3, 5],
      //   [3, 4, 5, 2, 8, 6, 1, 7, 0]
      // ];

      // // Solved Board (solvedBoard)
      // this.solvedBoard = [
      //   [5, 3, 4, 6, 7, 8, 9, 1, 2],
      //   [6, 7, 2, 1, 9, 5, 3, 4, 8],
      //   [1, 9, 8, 3, 4, 2, 5, 6, 7],
      //   [8, 5, 9, 7, 6, 1, 4, 2, 3],
      //   [4, 2, 6, 8, 5, 3, 7, 9, 1],
      //   [7, 1, 3, 9, 2, 4, 8, 5, 6],
      //   [9, 6, 1, 5, 3, 7, 2, 8, 4],
      //   [2, 8, 7, 4, 1, 9, 6, 3, 5],
      //   [3, 4, 5, 2, 8, 6, 1, 7, 9]
      // ];

      this.timerMode = this.currentPlayMode === 'countdown' ? 'down' : 'up';
      this.timerValue = this.currentPlayMode === 'countdown' && this.currentLevel ? (this.gameConfigService.countdownTime.get(this.currentLevel) ?? 0) : 0;

      //state(sudoku-board and timer) remaining after reload.
      const currentTimerKey = `${this.currentPlayerMode}|${this.currentPlayMode}|${this.currentLevel}`;
      this.gameStateService.setTimerKey(currentTimerKey);

      const savedTimerKey = localStorage.getItem('timerKey');
      console.log('ngOinit: ', currentTimerKey, savedTimerKey)

      let boardArray : FormArray[] = [];

      let loadStorage = false;
      //true: read localStorage, false: set localstorage
      if (savedTimerKey === currentTimerKey) {
        loadStorage = true;

        //initial board from localStorage
        const savedInitialBoardString = localStorage.getItem('initialBoard');
        let initialBoard: number[][] = [];
      
        if (savedInitialBoardString) {
          initialBoard = JSON.parse(savedInitialBoardString) as number[][];
          this.gameStateService.setInitialBoard(initialBoard);
        }
        this.initialBoard = this.gameStateService.getInitialBoard();
      
        //solved board from localStorage
        const savedSolvedBoardString = localStorage.getItem('solvedBoard');
        let solvedBoard: number[][] = [];
      
        if (savedSolvedBoardString) {
          solvedBoard = JSON.parse(savedSolvedBoardString) as number[][];
          this.gameStateService.setSolvedBoard(solvedBoard);
        }
        this.solvedBoard = this.gameStateService.getSolvedBoard();

        boardArray = this.createBoard(initialBoard);

      } else {
        loadStorage = false;
        localStorage.setItem('timerKey', currentTimerKey);

        this.sudokuService.generateSudoku(this.currentLevel);
        this.gameStateService.setInitialBoard(this.sudokuService.initialBoard);
        this.gameStateService.setSolvedBoard(this.sudokuService.solvedBoard);

        this.initialBoard = this.gameStateService.getInitialBoard();
        this.solvedBoard = this.gameStateService.getSolvedBoard();
        this.localTimerService.initialize(this.timerMode, this.timerValue, false);
        boardArray = this.createBoard(this.initialBoard);
      }

      this.form = this.fb.group({
        board: this.fb.array(boardArray)
      });

      //for winning game
      this.form.valueChanges.subscribe(board => {
        if (this.isSudokuCompleted()) {
          setTimeout(() => {
            if (this.isLoggedIn) {
              // Registered users will be recorded directly
              this.submitScoreLoggedIn();
              this.showGameWonDialog = true;
            } else {
              // Guest will show the nickname dialog first
              this.showNicknameDialog = true;
            }
          }, 100);
        }
      })
    });

    this.localTimerService.isPausedObservable.subscribe(paused => {
      this.isPaused = paused;
    });
  }

  //initialboard has value 0, in formcontrol 0 is present as null to show space in html
  createBoard(initialBoard: number[][]): FormArray[] {
    const board: FormArray[] = [];
    for (let i = 0; i < 9; i++) {
      const row: FormArray = this.fb.array([]);
      for (let j = 0; j < 9; j++) {
        const value = initialBoard[i][j];
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
    const savedSolvedBoard = this.gameStateService.getSolvedBoard();

    const userValue = this.getCell(row, col).value;
    const correctValue = savedSolvedBoard[row][col];

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
    } 9
    this.localTimerService.stop(true);
    return true
  }

  //for registered user
  submitScoreLoggedIn() {
    const scoreData = {
      playerMode: this.currentPlayerMode,
      playMode: this.currentPlayMode,
      level: this.currentLevel,
      time: this.localTimerService.getCurrentTime(),
      date: new Date().toISOString()
    };

    this.postScore(scoreData);
  }

  //for guest
  submitScore() {
    const scoreData = {
      nickname: this.nickname.trim(),
      playerMode: this.currentPlayerMode,
      playMode: this.currentPlayMode,
      level: this.currentLevel,
      time: this.localTimerService.getCurrentTime(),
      date: new Date().toISOString()
    };

    this.postScore(scoreData);
  }

  //todo translation
  private postScore(scoreData: any) {
    this.leaderboardService.submitScore(scoreData, this.isLoggedIn).subscribe({
      next: () => {
        console.log('Score submitted!');
        this.showNicknameDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Your score has been saved!',
          life: 3000
        });
        this.nickname = '';
        this.error = '';
        this.showGameWonDialog = true;
      },
      error: (err) => {
        this.showGameWonDialog = false;
        const messageKey = err.error?.messageKey;
        this.error = this.translate.instant(messageKey || 'ERROR.UNKNOWN');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save score. Please try again!',
          life: 3000
        });
        this.message = '';
      }
    });
  }


  onSkip() {
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
    this.localTimerService.stop(true);
    this.sudokuService.generateSudoku(this.currentLevel);
    this.gameStateService.setInitialBoard(this.sudokuService.initialBoard);
    this.gameStateService.setSolvedBoard(this.sudokuService.solvedBoard);

    this.initialBoard = this.gameStateService.getInitialBoard();
    this.solvedBoard = this.gameStateService.getSolvedBoard();

    const boardArray = this.createBoard(this.initialBoard);
    this.form = this.fb.group({
      board: this.fb.array(boardArray)
    });
    this.localTimerService.initialize(this.timerMode, this.timerValue);
    this.showGameWonDialog = false;
  }

  onClickNextLevel() {
    this.localTimerService.stop(true);
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
      this.currentPlayerMode,
      this.currentPlayMode,
      this.currentLevel
    ]);

    this.localTimerService.initialize(this.timerMode, this.timerValue);
    this.showGameWonDialog = false;
  }

  onClickRandomGame() {
    this.localTimerService.stop(true);
    const levels = ['easy', 'medium', 'hard', 'expert'];
    let randomLevel = levels[Math.floor(Math.random() * levels.length)];

    //make sure that randomlevel will be changed 
    // -> better and avoid timer wont be resseted because ngOinit wont be reload if url doesnt change
    while (randomLevel === this.currentLevel) {
      randomLevel = levels[Math.floor(Math.random() * levels.length)];
    }

    this.router.navigate([
      '/sudoku',
      this.currentPlayerMode,
      this.currentPlayMode,
      randomLevel
    ]);
    this.localTimerService.initialize(this.timerMode, this.timerValue);
    this.showGameWonDialog = false;
  }

  goToLeaderboard() {
    this.router.navigate(['/leaderboard'], {
      queryParams: {
        playerMode: this.currentPlayerMode,
        playMode: this.currentPlayMode,
        level: this.currentLevel,
        limit: 50
      }
    });

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
