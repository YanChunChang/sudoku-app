import { Component } from '@angular/core';
import { TimerMode } from '../../utils/utils';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SudokuBoardComponent } from '../sudoku-board/sudoku-board.component';
import { LocalTimerService } from '../../services/timer/local-timer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth/auth.service';
import { BoardService } from '../../services/game/board.service';
import { GameControlService } from '../../services/game/game-control.service';
import { GameStateService } from '../../services/game/game-state.service';
import { GameConfigService } from '../../services/game/gameconfig.service';
import { LeaderboardService } from '../../services/leaderboard/leaderboard-service.service';
import { SudokuService } from '../../services/sudoku.service';

@Component({
  selector: 'app-sudoku-board-coop',
  standalone: true,
  imports: [SudokuBoardComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './sudoku-board-coop.html',
  styleUrl: './sudoku-board-coop.scss',
  providers: [MessageService]
})
export class SudokuBoardCoop {
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
        this.gameStateService.setPlayerMode(params.get('single') ?? 'multi');
        this.gameStateService.setPlayMode(params.get('playmode') ?? 'normal');
        this.gameStateService.setLevel(params.get('level') ?? 'easy');
  
        this.currentPlayerMode = this.gameStateService.getCurrentPlayerMode();
        this.currentPlayMode = this.gameStateService.getCurrentPlayMode();
        this.currentLevel = this.gameStateService.getCurrentLevel();
        console.log('currentPlayerMode:', params);
  
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

  onClickReset() {
    if (this.isPaused) return;
    this.boardService.resetUserBoard(this.form, this.initialBoard);
  }

  onResume() {
    this.localTimerService.setPaused(false);
    this.localTimerService.start(this.timerMode, this.timerValue);
  }


}
