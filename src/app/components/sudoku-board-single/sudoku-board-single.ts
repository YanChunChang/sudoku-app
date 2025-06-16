import { Component } from '@angular/core';
import { SudokuBoardComponent } from "../sudoku-board/sudoku-board.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SudokuService } from '../../services/sudoku.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocalTimerService } from '../../services/timer/local-timer.service';
import { GameConfigService } from '../../services/game/gameconfig.service';
import { LeaderboardService } from '../../services/leaderboard/leaderboard-service.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { GameStateService } from '../../services/game/game-state.service';
import { CommonModule } from '@angular/common';
import { TimerComponent } from '../timer/timer.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { GameControlService } from '../../services/game/game-control.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { BoardService } from '../../services/game/board.service';
import { TimerMode } from '../../utils/utils';

@Component({
  selector: 'app-sudoku-board-single',
  standalone: true,
  imports: [SudokuBoardComponent, CommonModule, RouterModule, ReactiveFormsModule, ButtonModule, DialogModule, TranslateModule, FormsModule, ToastModule],
  templateUrl: './sudoku-board-single.html',
  styleUrl: './sudoku-board-single.scss',
  providers: [MessageService]
})
export class SudokuBoardSingle {
  private destroy$ = new Subject<void>();
  private formSubscription?: Subscription;
  form!: FormGroup;
  initialBoard: number[][] = [];
  solvedBoard: number[][] = [];
  userBoard: (number | null)[][] = [];
  timerMode: TimerMode = 'up';
  timerValue: number = 0;
  currentUsername = '';
  currentPlayMode = '';
  currentPlayerMode = '';
  currentLevel = '';
  showGameWonDialog = false;
  showNicknameDialog = false;
  showGameLostDialog = false;
  isSubmitted = false;
  isPaused = false;
  isLoggedIn = false;
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
    private translate: TranslateService,
    private authService: AuthService,
    private messageService: MessageService,
    private gameStateService: GameStateService,
    private gameControlService: GameControlService,
    private boardService: BoardService
  ) { 
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUsername = this.authService.getUsername() ?? '';


    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.gameStateService.setPlayerMode(params.get('playermode') ?? 'single');
      this.gameStateService.setPlayMode(params.get('playmode') ?? 'normal');
      this.gameStateService.setLevel(params.get('level') ?? 'easy');

      this.currentPlayerMode = this.gameStateService.getCurrentPlayerMode();
      this.currentPlayMode = this.gameStateService.getCurrentPlayMode();
      this.currentLevel = this.gameStateService.getCurrentLevel();

      this.timerMode = this.currentPlayMode === 'countdown' ? 'down' : 'up';
      this.timerValue = this.currentPlayMode === 'countdown' && this.currentLevel ? (this.gameConfigService.countdownTime.get(this.currentLevel) ?? 0) : 0;

      //state(sudoku-board and timer) remaining after reload.
      const currentTimerKey = `${this.currentPlayerMode}|${this.currentPlayMode}|${this.currentLevel}`;
      console.log('currentTimerKey:', currentTimerKey);
      this.gameStateService.setTimerKey(currentTimerKey);

      const TEST_MODE = false;
      const result = this.boardService.setupGameBoard(this.currentLevel, currentTimerKey, TEST_MODE);
      this.form = result.form;
      this.initialBoard = result.initialBoard;
      this.solvedBoard = result.solvedBoard;
      this.userBoard = result.userBoard;
      const loadStorage = result.loadStorage;

      this.localTimerService.initialize(this.timerMode, this.timerValue, loadStorage);

      //for winning game
      this.formSubscription?.unsubscribe();
      this.formSubscription = this.form.valueChanges.subscribe(boardValue => {
        localStorage.setItem('userBoard', JSON.stringify(boardValue.board));
        this.checkIfSudokuCompletedAndShowDialog();
      })

      //for losing game
      this.localTimerService.gameLost$.pipe(takeUntil(this.destroy$)).subscribe(lost => {
        if (lost) {
          this.showGameLostDialog = true;
          this.localTimerService.resetGameOver();
        }
      });

      this.localTimerService.isPausedObservable.subscribe(paused => {
        this.isPaused = paused;
      });
    });
  }

  checkIfSudokuCompletedAndShowDialog() {
    const isCompleted = this.boardService.isSudokuCompleted(this.form);

    if (isCompleted) {
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
  }

  onClickNewGame() {
    this.localTimerService.stop(true);
    const result = this.gameControlService.startNewGame(this.currentLevel);

    this.initialBoard = result.initialBoard;
    this.solvedBoard = result.solvedBoard;
    this.userBoard = result.userBoard;

    const boardArray = this.boardService.createBoard(this.initialBoard, this.userBoard);
    this.form = this.fb.group({
      board: this.fb.array(boardArray)
    });

    this.formSubscription?.unsubscribe();
    this.formSubscription = this.form.valueChanges.subscribe(boardValue => {
      localStorage.setItem('userBoard', JSON.stringify(boardValue.board));
      this.checkIfSudokuCompletedAndShowDialog();
    });

    this.localTimerService.initialize(this.timerMode, this.timerValue);
    this.showGameWonDialog = false;
    this.showGameLostDialog = false;
  }


  onClickNextLevel() {
    this.localTimerService.stop(true);
    this.currentLevel = this.gameControlService.goToNextLevel(this.currentLevel);

    this.gameControlService.navigateToGame(
      this.currentPlayerMode,
      this.currentPlayMode,
      this.currentLevel
    );

    this.formSubscription?.unsubscribe();
    this.localTimerService.initialize(this.timerMode, this.timerValue);
    this.showGameWonDialog = false;
    this.showGameLostDialog = false;
  }

  onClickRandomGame() {
    this.localTimerService.stop(true);
    let randomLevel = this.gameControlService.startRandomGame(this.currentLevel);

    this.gameControlService.navigateToGame(
      this.currentPlayerMode,
      this.currentPlayMode,
      randomLevel
    );

    this.formSubscription?.unsubscribe();
    this.localTimerService.initialize(this.timerMode, this.timerValue);
    this.showGameWonDialog = false;
    this.showGameLostDialog = false;
  }

  goToLeaderboard() {
    this.localTimerService.stop(true);
    this.onClickNewGame();

    this.gameControlService.goToLeaderboard(
      this.currentPlayerMode,
      this.currentPlayMode,
      this.currentLevel
    );

    this.showGameWonDialog = false;
  }


  onClickReset() {
    if (this.isPaused) return;
    this.boardService.resetUserBoard(this.form, this.initialBoard);
  }

  onResume() {
    this.localTimerService.setPaused(false);
    this.localTimerService.start(this.timerMode, this.timerValue);
  }

  onClickResetForLost() {
    this.showGameLostDialog = false;
    this.localTimerService.initialize(this.timerMode, this.timerValue, false);
    this.boardService.resetUserBoard(this.form, this.initialBoard);
  }

  onSkip() {
    this.showNicknameDialog = false;
    this.showGameWonDialog = true;
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

  private postScore(scoreData: any) {
    this.leaderboardService.submitScore(scoreData, this.isLoggedIn).subscribe({
      next: (res) => {
        console.log('Score submitted!');
        console.log('res data', res);
        this.showNicknameDialog = false;
        this.message = this.translate.instant(res.messageKey);

        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('DIALOG_NICKNAME.SUCCESS'),
          detail: this.message,
          life: 3000
        });

        let scoreWithId;
        scoreWithId = {
          ...scoreData,
          id: res.id
        };
        localStorage.setItem('lastScore', JSON.stringify(scoreWithId));

        this.nickname = '';
        this.error = '';
        this.showGameWonDialog = true;
        this.isSubmitted = true;
      },
      error: (err) => {
        this.showGameWonDialog = false;
        const messageKey = err.error?.messageKey;
        this.error = this.translate.instant(messageKey);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('DIALOG_NICKNAME.ERROR'),
          detail: this.error,
          life: 3000
        });
        this.message = '';
      },
      complete: () => {
        this.isSubmitted = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.formSubscription?.unsubscribe();
    this.sudokuService.clearBoards();
  }
}
