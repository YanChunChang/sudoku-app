import { Component, HostListener, ViewEncapsulation } from '@angular/core';
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
import { SocketService } from '../../services/socket/socket.service';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-sudoku-board-coop',
  standalone: true,
  imports: [SudokuBoardComponent, ReactiveFormsModule, FormsModule, CommonModule, ToastModule],
  templateUrl: './sudoku-board-coop.html',
  styleUrl: './sudoku-board-coop.scss',
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None,
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
  roomId = '';
  userId = '';
  previousBoardValue: number[][] = [];


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
    private boardService: BoardService,
    private socketService: SocketService
  ) {
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUsername = this.authService.getUsername() ?? '';
    this.userId = this.authService.getUserId() ?? '';
    this.socketService.loadBoard();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.gameStateService.setPlayerMode(params.get('single') ?? 'multi');
      this.gameStateService.setPlayMode(params.get('playmode') ?? 'normal');
      this.gameStateService.setLevel(params.get('level') ?? 'easy');

      this.currentPlayerMode = this.gameStateService.getCurrentPlayerMode();
      this.currentPlayMode = this.gameStateService.getCurrentPlayMode();
      this.currentLevel = this.gameStateService.getCurrentLevel();

      this.roomId = params.get('roomId') ?? 'defaultRoom';

      this.timerMode = this.currentPlayMode === 'countdown' ? 'down' : 'up';
      this.timerValue = this.currentPlayMode === 'countdown' && this.currentLevel ? (this.gameConfigService.countdownTime.get(this.currentLevel) ?? 0) : 0;

      if (this.userId && this.roomId && !this.socketService.isConnected()) {
        this.socketService.reconnect(this.roomId, this.userId, this.currentLevel, this.currentUsername);
      }

      //state(sudoku-board and timer) remaining after reload.
      const currentTimerKey = `${this.currentPlayerMode}|${this.currentPlayMode}|${this.currentLevel}|${this.roomId}`;
      console.log('currentTimerKey:', currentTimerKey);
      this.gameStateService.setTimerKey(currentTimerKey);

      this.socketService.board$.subscribe(externalboard => {
        if (!externalboard) return;

        console.log('Board empfangen', externalboard);
        const TEST_MODE = false;
        const result = this.boardService.setupGameBoard(this.currentLevel, currentTimerKey, TEST_MODE, externalboard);
        this.form = result.form;
        this.initialBoard = result.initialBoard;
        this.solvedBoard = result.solvedBoard;
        this.userBoard = result.userBoard;
        const loadStorage = result.loadStorage;
        this.localTimerService.initialize(this.timerMode, this.timerValue, loadStorage);

        this.socketService.onReceiveFocusUpdate((username, row, col) => {
          const prev = document.querySelector(`.focus-other-player`);
          if (prev) {
            prev.classList.remove('focus-other-player');
            prev.removeAttribute('data-user');
          }

          const cell = document.getElementById(`cell-${row}-${col}`);
          if (cell) {
            cell.classList.add('focus-other-player');
            cell.setAttribute('data-user', username);
          } else {
            console.warn('Zelle nicht gefunden:', `cell-${row}-${col}`);
          }
        });

        this.socketService.onReceiveCellUpdate((row, col, value) => {
          this.form.get(['board', row, col])?.setValue(value, { emitEvent: false });
          // LocalStorage manuell aktualisieren
          const savedBoardString = localStorage.getItem('userBoard');
          let userBoard: (number | null)[][] = [];

          if (savedBoardString) {
            userBoard = JSON.parse(savedBoardString);
          } else {
            userBoard = this.initialBoard.map(row => row.map(cell => cell === 0 ? null : cell));
          }

          userBoard[row][col] = value;
          localStorage.setItem('userBoard', JSON.stringify(userBoard));
        });

        //for winning game
        this.previousBoardValue = this.form.value.board;
        this.formSubscription?.unsubscribe();
        this.formSubscription = this.form?.valueChanges.subscribe(newboardValue => {
          //cell update, visible for another player
          const newBoard = newboardValue.board;
          for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
              const newVal = newBoard[row][col];
              const oldVal = this.previousBoardValue?.[row]?.[col];

              if (newVal !== oldVal) {
                console.log(`Zelle geändert: [${row}, ${col}] = ${newVal}`);
                this.socketService.sendCellUpdate(this.roomId, row, col, newVal);
              }
            }
          }
          this.previousBoardValue = newBoard;
          localStorage.setItem('userBoard', JSON.stringify(newboardValue.board));

          //focus feld, sending message
          document.querySelector('.grid-container')?.addEventListener('focusin', (event: any) => {
            const target = event.target as HTMLElement;
            const id = target?.id;

            if (id?.startsWith('cell-')) {
              const [_, row, col] = id.split('-');
              this.socketService.sendCellFocus(this.roomId, this.currentUsername, Number(row), Number(col));
            }
          });
          this.checkIfSudokuCompletedAndShowDialog();
        })
      });

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

    //player leaves
    this.socketService.onPlayerLeft((username, userId) => {
      console.warn('Spieler hat das Spiel verlassen:', username);

      const cursorEl = document.getElementById(`cursor-${userId}`);
      if (cursorEl) {
        console.log('Entferne Cursor von', username);
        cursorEl.remove();
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Spiel verlassen',
        detail: username + ' verlässrt das Spiel',
        life: 7000
      });
    });
  }

  ngAfterViewInit() {
    this.socketService.onReceiveMousePosition((data) => {
      const { userId, username, x, y } = data;
      let cursorEl = document.getElementById(`cursor-${userId}`);
      if (!cursorEl) {
        cursorEl = document.createElement('div');
        cursorEl.id = `cursor-${userId}`;
        cursorEl.classList.add('remote-cursor');
        cursorEl.innerText = username;
        document.body.appendChild(cursorEl);
      }

      cursorEl.style.left = x + 'px';
      cursorEl.style.top = y + 'px';
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.socketService.isConnected()) {
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      this.socketService.sendMousePosition(this.roomId, this.userId, this.currentUsername, mouseX, mouseY);
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

  private cleanupRemoteCursors(): void {
    console.log('Cursor-Cleanup');
    document.querySelectorAll('.remote-cursor').forEach(el => {
      console.log('Entferne:', el);
      el.remove();
    });
  }

  ngOnDestroy() {
    console.log('SudokuBoardCoop wird zerstört.');
    this.socketService.disconnect();
    this.cleanupRemoteCursors();
    this.destroy$.next();
    this.destroy$.complete();
  }

}
