import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { LocalTimerService } from '../../services/timer/local-timer.service';
import { TimerMode } from '../../utils/utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {
  @Input() mode!: TimerMode;
  @Input() startFrom!: number;
  elapsedSeconds: number = 0;
  timerSubscription!: Subscription;
  isRunning: boolean = true;
  isChallengeMode : boolean = false;

  constructor(private localTimeService: LocalTimerService, private route: ActivatedRoute,){
  }

  ngOnInit() {
    this.startTimer();
    this.localTimeService.isPausedObservable.subscribe(paused => {
      this.isRunning = !paused;
    });

    this.route.paramMap.subscribe( param => {
      if(param.get('playmode') === 'countdown'){
        this.isChallengeMode = true;
      }
    });
  }

  startTimer() {
    this.localTimeService.start(this.mode, this.startFrom);
    this.timerSubscription = this.localTimeService.timeObservable.subscribe((seconds: number) => {
      this.elapsedSeconds = seconds;
    });
  }

  stopTimer() {
    this.localTimeService.pause();
  }

  resetTimer() {
    this.localTimeService.reset();
    this.elapsedSeconds = 0;
    this.isRunning = true;
  }

  get formattedTime(): string {
    const hour = Math.floor(this.elapsedSeconds / 3600);
    let restTime = this.elapsedSeconds - hour * 3600;
    const minutes = Math.floor(restTime / 60);
    const seconds = this.elapsedSeconds % 60;
    return `${this.pad(hour)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }


  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
    this.localTimeService.pause();
    this.localTimeService.stop();
  }
}
